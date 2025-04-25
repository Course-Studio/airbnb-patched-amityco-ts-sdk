import hash from 'object-hash';
import { pullFromCache, pushToCache } from '~/cache/api';
import { PostPaginationController } from './PostPaginationController';
import { PostQueryStreamController } from './PostQueryStreamController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
import {
  onPostCreated,
  onPostUpdated,
  onPostDeleted,
  onPostFlagged,
  onPostUnflagged,
  onPostReactionAdded,
  onPostReactionRemoved,
  onPostApproved,
  onPostDeclined,
} from '~/postRepository/events';
import {
  filterByFeedType,
  filterByPostDataTypes,
  filterByPropEquality,
  sortByFirstCreated,
  sortByLastCreated,
} from '~/core/query';
import { isNonNullable } from '~/utils';
import { EnumPostActions } from '../enums';
import { LinkedObject } from '~/utils/linkedObject';
import { preparePostPayload } from '~/postRepository/utils/payload';
import { convertEventPayload } from '~/utils/event';
import { onCommentCreated, onCommentDeleted } from '~/commentRepository';
import { getPost } from '~/postRepository/internalApi/getPost';
import { onPostUpdatedLocal } from '~/postRepository/events/onPostUpdatedLocal';
import { onLocalPostReactionAdded } from '~/postRepository/events/onLocalPostReactionAdded';
import { onLocalPostReactionRemoved } from '~/postRepository/events/onLocalPostReactionRemoved';
import { onLocalPostDeleted } from '~/postRepository/events/onLocalPostDeleted';

export class PostLiveCollectionController extends LiveCollectionController<
  'post',
  Amity.PostLiveCollection,
  Amity.Post,
  PostPaginationController
> {
  private queryStreamController: PostQueryStreamController;

  private query: Amity.PostLiveCollection;

  constructor(query: Amity.PostLiveCollection, callback: Amity.LiveCollectionCallback<Amity.Post>) {
    const queryStreamId = hash(query);
    const cacheKey = ['posts', 'collection', queryStreamId];
    const paginationController = new PostPaginationController(query);

    super(paginationController, queryStreamId, cacheKey, callback);

    this.query = query;
    this.queryStreamController = new PostQueryStreamController(
      this.query,
      this.cacheKey,
      this.notifyChange.bind(this),
      preparePostPayload,
    );

    this.callback = callback.bind(this);
    this.loadPage({ initial: true });
  }

  protected setup() {
    const collection = pullFromCache<Amity.PostLiveCollectionCache>(this.cacheKey)?.data;
    if (!collection) {
      pushToCache(this.cacheKey, {
        data: [],
        params: {},
      });
    }
  }

  protected async persistModel(queryPayload: Amity.PostPayload & Amity.Pagination) {
    await this.queryStreamController.saveToMainDB(queryPayload);
  }

  protected persistQueryStream({
    response,
    direction,
    refresh,
  }: Amity.LiveCollectionPersistQueryStreamParams<'post'>) {
    this.queryStreamController.appendToQueryStream(response, direction, refresh);
  }

  startSubscription() {
    return this.queryStreamController.subscribeRTE([
      { fn: onPostCreated, action: EnumPostActions.OnPostCreated },
      { fn: onPostUpdated, action: EnumPostActions.OnPostUpdated },
      { fn: onPostUpdatedLocal, action: EnumPostActions.OnPostUpdated },
      { fn: onPostDeleted, action: EnumPostActions.OnPostDeleted },
      { fn: onPostFlagged, action: EnumPostActions.OnPostFlagged },
      { fn: onPostUnflagged, action: EnumPostActions.OnPostUnflagged },
      { fn: onPostApproved, action: EnumPostActions.OnPostApproved },
      { fn: onPostDeclined, action: EnumPostActions.OnPostDeclined },
      { fn: onPostReactionAdded, action: EnumPostActions.OnPostReactionAdded },
      { fn: onPostReactionRemoved, action: EnumPostActions.OnPostReactionRemoved },
      { fn: onLocalPostReactionAdded, action: EnumPostActions.OnPostReactionAdded },
      { fn: onLocalPostReactionRemoved, action: EnumPostActions.OnPostReactionRemoved },
      { fn: onLocalPostDeleted, action: EnumPostActions.OnPostDeleted },
      {
        fn: convertEventPayload(
          (callback: Amity.Listener<Amity.InternalComment>) => {
            return onCommentCreated(async (comment: Amity.InternalComment) => {
              const currentCollection = pullFromCache<Amity.PostLiveCollectionCache>(
                this.cacheKey,
              )?.data;

              if (!currentCollection || currentCollection.data.includes(comment.referenceId))
                return;

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
              const currentCollection = pullFromCache<Amity.PostLiveCollectionCache>(
                this.cacheKey,
              )?.data;

              if (!currentCollection || currentCollection.data.includes(comment.referenceId))
                return;

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
    const collection = pullFromCache<Amity.PostLiveCollectionCache>(this.cacheKey)?.data;
    if (!collection) return;

    const data = this.applyFilter(
      collection.data
        .map(id => pullFromCache<Amity.InternalPost>(['post', 'get', id])!)
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

    if (!this.query.includeDeleted) {
      posts = filterByPropEquality(posts, 'isDeleted', false);
    }

    if (this.query.tags) {
      posts = posts.filter(p => p.tags?.some(t => this.query.tags?.includes(t)));
    }

    if (this.query.targetType === 'community' && this.query.feedType) {
      posts = filterByFeedType(posts, this.query.feedType);
    }

    if (this.query.dataTypes?.length) {
      posts = filterByPostDataTypes(posts, this.query.dataTypes);
    }

    switch (this.query.sortBy) {
      case 'firstCreated':
        posts = posts.sort(sortByFirstCreated);
        break;
      case 'lastCreated':
      default:
        posts = posts.sort(sortByLastCreated);
        break;
    }

    return posts;
  }
}
