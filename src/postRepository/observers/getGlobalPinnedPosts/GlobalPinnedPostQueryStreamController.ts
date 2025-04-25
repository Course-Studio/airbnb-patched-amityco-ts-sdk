import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { pullFromCache, pushToCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { getResolver } from '~/core/model';
import { getActiveClient } from '~/client';
import { EnumPostActions } from '../enums';

export class GlobalPinnedPostQueryStreamController extends QueryStreamController<
  Amity.PinnedPostPayload,
  Amity.GlobalPinnedPostLiveCollection
> {
  private notifyChange: (params: Amity.LiveCollectionNotifyParams) => void;

  private preparePayload: (response: Amity.PinnedPostPayload) => Amity.ProcessedPostPayload;

  constructor(
    query: Amity.GlobalPinnedPostLiveCollection,
    cacheKey: string[],
    notifyChange: (params: Amity.LiveCollectionNotifyParams) => void,
    preparePayload: (response: Amity.PinnedPostPayload) => Amity.ProcessedPostPayload,
  ) {
    super(query, cacheKey);
    this.notifyChange = notifyChange;
    this.preparePayload = preparePayload;
  }

  // eslint-disable-next-line class-methods-use-this
  async saveToMainDB(response: Amity.PinnedPostPayload) {
    const client = getActiveClient();
    const cachedAt = client.cache && Date.now();

    if (client.cache) {
      ingestInCache(response, { cachedAt });
    }
  }

  appendToQueryStream(
    response: Amity.PinnedPostPayload & Partial<Amity.Pagination>,
    direction: Amity.LiveCollectionPageDirection,
    refresh = false,
  ) {
    if (refresh) {
      pushToCache(this.cacheKey, {
        data: response.pins.map(getResolver('pin')),
      });
    } else {
      const collection = pullFromCache<Amity.PinnedPostLiveCollectionCache>(this.cacheKey)?.data;

      const pinnedPosts = collection?.data ?? [];

      pushToCache(this.cacheKey, {
        ...collection,
        data: [...new Set([...pinnedPosts, ...response.pins.map(getResolver('pin'))])],
      });

      this.notifyChange({
        origin: Amity.LiveDataOrigin.SERVER,
        loading: false,
      });
    }
  }

  reactor(action: EnumPostActions) {
    return (post: Amity.InternalPost) => {
      const collection = pullFromCache<Amity.PostLiveCollectionCache>(this.cacheKey)?.data;

      if (!collection) return;

      if (action === EnumPostActions.OnPostDeleted) {
        collection.data = collection.data.filter(
          referenceId => referenceId !== `global#${post.postId}`,
        );
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
