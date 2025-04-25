import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { pullFromCache, pushToCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { getResolver } from '~/core/model';
import { getActiveClient } from '~/client';
import { EnumPostActions } from '../enums';

export class PostQueryStreamController extends QueryStreamController<
  Amity.PostPayload,
  Amity.PostLiveCollection
> {
  private notifyChange: (params: Amity.LiveCollectionNotifyParams) => void;

  private preparePayload: (response: Amity.PostPayload) => Amity.ProcessedPostPayload;

  constructor(
    query: Amity.PostLiveCollection,
    cacheKey: string[],
    notifyChange: (params: Amity.LiveCollectionNotifyParams) => void,
    preparePayload: (response: Amity.PostPayload) => Amity.ProcessedPostPayload,
  ) {
    super(query, cacheKey);
    this.notifyChange = notifyChange;
    this.preparePayload = preparePayload;
  }

  async saveToMainDB(response: Amity.PostPayload) {
    const processedPayload = await this.preparePayload(response);

    const client = getActiveClient();
    const cachedAt = client.cache && Date.now();

    if (client.cache) {
      ingestInCache(processedPayload, { cachedAt });
    }
  }

  appendToQueryStream(
    response: Amity.PostPayload & Partial<Amity.Pagination>,
    direction: Amity.LiveCollectionPageDirection,
    refresh = false,
  ) {
    if (refresh) {
      pushToCache(this.cacheKey, {
        data: response.posts.map(getResolver('post')),
      });
    } else {
      const collection = pullFromCache<Amity.CommunityLiveCollectionCache>(this.cacheKey)?.data;

      const posts = collection?.data ?? [];

      pushToCache(this.cacheKey, {
        ...collection,
        data: [...new Set([...posts, ...response.posts.map(getResolver('post'))])],
      });
    }
  }

  reactor(action: EnumPostActions) {
    return (post: Amity.InternalPost) => {
      const collection = pullFromCache<Amity.PostLiveCollectionCache>(this.cacheKey)?.data;

      if (!collection) return;

      if (post.parentPostId && post.isDeleted) {
        const parentPost = pullFromCache<Amity.InternalPost>([
          'post',
          'get',
          post.parentPostId,
        ])?.data;

        if (!parentPost || parentPost?.targetId !== this.query.targetId) return;

        parentPost.children = parentPost.children.filter(childId => childId !== post.postId);
        pushToCache(['post', 'get', parentPost.postId], parentPost);
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
