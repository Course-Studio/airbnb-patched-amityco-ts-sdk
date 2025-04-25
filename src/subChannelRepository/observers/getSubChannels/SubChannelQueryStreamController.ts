/* eslint-disable no-use-before-define */
import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { pullFromCache, pushToCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { getActiveClient } from '~/client';

export class SubChannelQueryStreamController extends QueryStreamController<
  Amity.SubChannelPayload,
  Amity.SubChannelLiveCollection
> {
  private notifyChange: (params: Amity.LiveCollectionNotifyParams) => void;

  private preparePayload: (
    response: Amity.SubChannelPayload,
  ) => Promise<Amity.ProcessedSubChannelPayload>;

  constructor(
    query: Amity.SubChannelLiveCollection,
    cacheKey: string[],
    notifyChange: (params: Amity.LiveCollectionNotifyParams) => void,
    preparePayload: (
      response: Amity.SubChannelPayload,
    ) => Promise<Amity.ProcessedSubChannelPayload>,
  ) {
    super(query, cacheKey);
    this.notifyChange = notifyChange;
    this.preparePayload = preparePayload;
  }

  async saveToMainDB(response: Amity.SubChannelPayload) {
    const processedPayload = await this.preparePayload(response);

    const client = getActiveClient();
    const cachedAt = client.cache && Date.now();

    if (client.cache) {
      ingestInCache(processedPayload, { cachedAt });
    }
  }

  appendToQueryStream(
    response: Amity.SubChannelPayload & Partial<Amity.Pagination>,
    direction: Amity.LiveCollectionPageDirection,
    refresh = false,
  ) {
    if (refresh) {
      pushToCache(this.cacheKey, {
        data: response.messageFeeds.map(({ messageFeedId }) => messageFeedId),
      });
    } else {
      const collection = pullFromCache<Amity.SubChannelLiveCollectionCache>(this.cacheKey)?.data;

      const subChannels = collection?.data ?? [];

      pushToCache(this.cacheKey, {
        ...collection,
        data: [
          ...new Set([
            ...subChannels,
            ...response.messageFeeds.map(({ messageFeedId }) => messageFeedId),
          ]),
        ],
      });
    }
  }

  reactor(action: string) {
    return (payload: Amity.SubChannel | Amity.SubChannel[]) => {
      const collection = pullFromCache<Amity.SubChannelLiveCollectionCache>(this.cacheKey)?.data;
      if (!collection) return;

      if (!Array.isArray(payload)) {
        if (this.query.channelId !== payload.channelId) return;

        if (action === 'onCreate') {
          collection.data = [...new Set([payload.subChannelId, ...collection.data])];
        }

        pushToCache(this.cacheKey, collection);
      }

      this.notifyChange({ origin: Amity.LiveDataOrigin.EVENT, loading: false });
    };
  }

  subscribeRTE(
    createSubscriber: {
      fn: (reactor: Amity.Listener<Amity.SubChannel | Amity.SubChannel[]>) => Amity.Unsubscriber;
      action: string;
    }[],
  ) {
    return createSubscriber.map(subscriber => subscriber.fn(this.reactor(subscriber.action)));
  }
}
