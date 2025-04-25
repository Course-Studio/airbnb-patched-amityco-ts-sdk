import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { pullFromCache, pushToCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { getActiveClient } from '~/client';
import { EnumPostActions } from '../enums';
import { preparePostResponse } from './utils';

export class SemanticSearchPostQueryStreamController extends QueryStreamController<
  Amity.SemanticSearchPostPayload,
  Amity.SemanticSearchPostLiveCollection
> {
  private notifyChange: (params: Amity.LiveCollectionNotifyParams) => void;

  private preparePayload: (
    response: Amity.SemanticSearchPostPayload,
  ) => Amity.ProcessedSemanticSearchPostPayload;

  constructor(
    query: Amity.SemanticSearchPostLiveCollection,
    cacheKey: string[],
    notifyChange: (params: Amity.LiveCollectionNotifyParams) => void,
    preparePayload: (
      response: Amity.SemanticSearchPostPayload,
    ) => Amity.ProcessedSemanticSearchPostPayload,
  ) {
    super(query, cacheKey);
    this.notifyChange = notifyChange;
    this.preparePayload = preparePayload;
  }

  async saveToMainDB(response: Amity.SemanticSearchPostPayload) {
    const processedPayload = this.preparePayload(response);

    const client = getActiveClient();
    const cachedAt = client.cache && Date.now();

    if (client.cache) {
      ingestInCache(processedPayload, { cachedAt });
    }
  }

  appendToQueryStream(
    response: Amity.SemanticSearchPostPayload & Partial<Amity.Pagination>,
    direction: Amity.LiveCollectionPageDirection,
    refresh = false,
  ) {
    if (refresh) {
      pushToCache(this.cacheKey, {
        data: preparePostResponse(response),
      });
    } else {
      const collection = pullFromCache<Amity.CommunityLiveCollectionCache>(this.cacheKey)?.data;

      const posts = collection?.data ?? [];

      pushToCache(this.cacheKey, {
        ...collection,
        data: [...new Set([...posts, ...preparePostResponse(response)])],
      });
    }
  }

  reactor(action: EnumPostActions) {
    return (post: Amity.InternalPost) => {
      const collection = pullFromCache<Amity.SemanticSearchPostLiveCollectionCache>(
        this.cacheKey,
      )?.data;

      if (!collection) return;

      if (post.parentPostId && post.isDeleted) {
        const parentSemanticSearchPost = pullFromCache<Amity.InternalPost>([
          'post',
          'get',
          post.parentPostId,
        ])?.data;

        if (!parentSemanticSearchPost || parentSemanticSearchPost?.targetId !== this.query.targetId)
          return;

        parentSemanticSearchPost.children = parentSemanticSearchPost.children.filter(
          childId => childId !== post.postId,
        );
        pushToCache(['post', 'get', parentSemanticSearchPost.postId], parentSemanticSearchPost);
      } else {
        if (this.query.targetId !== post.targetId) return;
        if (this.query.targetType !== post.targetType) return;
      }

      if (action === EnumPostActions.OnPostDeclined) {
        collection.data = collection.data.filter(postId => postId !== post.postId);
      }

      if (action === EnumPostActions.OnPostCreated || action === EnumPostActions.OnPostApproved) {
        collection.data = [...new Set([post.postId, ...collection.data])];
      }

      pushToCache(this.cacheKey, collection);
      this.notifyChange({ origin: Amity.LiveDataOrigin.EVENT, loading: false });
    };
  }

  subscribeRTE(
    createSubscriber: {
      fn: (reactor: (post: Amity.InternalPost) => void) => Amity.Unsubscriber;
      action: EnumPostActions;
    }[],
  ) {
    return createSubscriber.map(subscriber => subscriber.fn(this.reactor(subscriber.action)));
  }
}
