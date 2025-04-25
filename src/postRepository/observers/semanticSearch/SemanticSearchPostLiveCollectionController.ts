import hash from 'object-hash';
import { pullFromCache, pushToCache } from '~/cache/api';
import { SemanticSearchPostPaginationController } from './SemanticSearchPostPaginationController';
import { SemanticSearchPostQueryStreamController } from './SemanticSearchPostQueryStreamController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
import {
  onPostUpdated,
  onPostDeleted,
  onPostFlagged,
  onPostUnflagged,
  onPostReactionAdded,
  onPostReactionRemoved,
  onPostApproved,
  onPostDeclined,
} from '~/postRepository/events';
import { filterByPostDataTypes, filterByPropEquality } from '~/core/query';
import { isNonNullable } from '~/utils';
import { EnumPostActions } from '../enums';
import { LinkedObject } from '~/utils/linkedObject';
import { prepareSemanticSearchPostPayload } from '~/postRepository/utils/payload';
import { convertEventPayload } from '~/utils/event';
import { onCommentCreated, onCommentDeleted } from '~/commentRepository';
import { getPost } from '~/postRepository/api/getPost';
import { getPostIdsFromCache } from './utils';

export class SemanticSearchPostLiveCollectionController extends LiveCollectionController<
  'semanticSearchPost',
  Amity.SemanticSearchPostLiveCollection,
  Amity.Post,
  SemanticSearchPostPaginationController
> {
  private queryStreamController: SemanticSearchPostQueryStreamController;

  private query: Amity.SemanticSearchPostLiveCollection;

  constructor(
    inputQuery: Amity.SemanticSearchPostLiveCollection,
    callback: Amity.LiveCollectionCallback<Amity.Post>,
  ) {
    const query = {
      ...inputQuery,
      matchingOnlyParentPost:
        inputQuery.matchingOnlyParentPost == null ? true : inputQuery.matchingOnlyParentPost,
      dataTypes: inputQuery.dataTypes == null ? ['text', 'image'] : inputQuery.dataTypes,
    };

    const queryStreamId = hash(query);
    const cacheKey = ['posts', 'collection', queryStreamId];
    const paginationController = new SemanticSearchPostPaginationController(query);

    super(paginationController, queryStreamId, cacheKey, callback);

    this.query = query;

    this.queryStreamController = new SemanticSearchPostQueryStreamController(
      this.query,
      this.cacheKey,
      this.notifyChange.bind(this),
      prepareSemanticSearchPostPayload,
    );

    this.callback = callback.bind(this);
    this.loadPage({ initial: true });
  }

  protected setup() {
    const collection = pullFromCache<Amity.SemanticSearchPostLiveCollectionCache>(
      this.cacheKey,
    )?.data;
    if (!collection) {
      pushToCache(this.cacheKey, {
        data: [],
        params: {},
      });
    }
  }

  protected async persistModel(queryPayload: Amity.SemanticSearchPostPayload & Amity.Pagination) {
    await this.queryStreamController.saveToMainDB(queryPayload);
  }

  protected persistQueryStream({
    response,
    direction,
    refresh,
  }: Amity.LiveCollectionPersistQueryStreamParams<'semanticSearchPost'>) {
    this.queryStreamController.appendToQueryStream(response, direction, refresh);
  }

  startSubscription() {
    return this.queryStreamController.subscribeRTE([
      { fn: onPostUpdated, action: EnumPostActions.OnPostUpdated },
      { fn: onPostDeleted, action: EnumPostActions.OnPostDeleted },
      { fn: onPostFlagged, action: EnumPostActions.OnPostFlagged },
      {
        fn: onPostUnflagged,
        action: EnumPostActions.OnPostUnflagged,
      },
      { fn: onPostApproved, action: EnumPostActions.OnPostApproved },
      { fn: onPostDeclined, action: EnumPostActions.OnPostDeclined },
      {
        fn: onPostReactionAdded,
        action: EnumPostActions.OnPostReactionAdded,
      },
      {
        fn: onPostReactionRemoved,
        action: EnumPostActions.OnPostReactionRemoved,
      },
      {
        fn: convertEventPayload(
          (callback: Amity.Listener<Amity.InternalComment>) => {
            return onCommentCreated(async (comment: Amity.InternalComment) => {
              const collectionCache = pullFromCache<string[]>(this.cacheKey);

              const currentCollectionPostIds = getPostIdsFromCache(collectionCache?.data);

              if (currentCollectionPostIds.includes(comment.referenceId)) return;

              await getPost(comment.referenceId);
              callback(comment);
            });
          },
          'referenceId',
          'post',
        ),
        action: EnumPostActions.OnPostUpdated,
      },
      {
        fn: convertEventPayload(
          (callback: Amity.Listener<Amity.InternalComment>) => {
            return onCommentDeleted(async (comment: Amity.InternalComment) => {
              const collectionCache = pullFromCache<string[]>(this.cacheKey);

              const currentCollectionPostIds = getPostIdsFromCache(collectionCache?.data);

              if (currentCollectionPostIds.includes(comment.referenceId)) return;

              await getPost(comment.referenceId);
              callback(comment);
            });
          },
          'referenceId',
          'post',
        ),
        action: EnumPostActions.OnPostUpdated,
      },
    ]);
  }

  notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams) {
    const collection = pullFromCache<Amity.SemanticSearchPostLiveCollectionCache>(
      this.cacheKey,
    )?.data;
    if (!collection) return;

    const data = this.applyFilter(
      collection.data
        .map(postIdWithScore => {
          const [postId, score] = postIdWithScore.split(':');
          return {
            postId,
            score: parseFloat(score),
          };
        })
        .sort((a, b) => b.score - a.score)
        .map(({ postId }) => pullFromCache<Amity.InternalPost>(['post', 'get', postId])!)
        .filter(isNonNullable)
        .map(({ data }) => data) ?? [],
    ).map(LinkedObject.post);

    if (!this.shouldNotify(data) && origin === 'event') return;

    this.callback({
      onNextPage: () => this.loadPage({ direction: Amity.LiveCollectionPageDirection.NEXT }),
      data,
      hasNextPage: !!this.paginationController.getNextToken(),
      loading,
      error,
    });
  }

  applyFilter(data: Amity.InternalPost[]) {
    let posts = data;

    if (this.query.targetType) {
      posts = posts.filter(post => post.targetType === this.query.targetType);
    }

    if (this.query.targetId) {
      posts = posts.filter(post => post.targetId === this.query.targetId);
    }

    if (this.query.dataTypes && this.query.dataTypes.length > 0) {
      posts = filterByPostDataTypes(posts, this.query.dataTypes);
    }

    return posts;
  }
}
