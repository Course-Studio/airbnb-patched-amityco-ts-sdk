import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { pullFromCache, pushToCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { getResolver } from '~/core/model';
import { getActiveClient } from '~/client';

export class PinnedPostQueryStreamController extends QueryStreamController<
  Amity.PinnedPostPayload,
  Amity.PinnedPostLiveCollection
> {
  private notifyChange: (params: Amity.LiveCollectionNotifyParams) => void;

  private preparePayload: (response: Amity.PinnedPostPayload) => Amity.ProcessedPostPayload;

  constructor(
    query: Amity.PinnedPostLiveCollection,
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
}
