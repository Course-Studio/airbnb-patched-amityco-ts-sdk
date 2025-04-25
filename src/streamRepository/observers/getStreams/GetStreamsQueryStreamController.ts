import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { getActiveClient } from '~/client';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { GetStreamsPageController } from '~/streamRepository/observers/getStreams/GetStreamsPageController';
import { getResolver } from '~/core/model';
import { pullFromCache, pushToCache } from '~/cache/api';

export class GetStreamsQueryStreamController extends QueryStreamController<
  Amity.StreamPayload,
  Amity.StreamLiveCollection
> {
  private notifyChange: (params: Amity.LiveCollectionNotifyParams) => void;

  private paginationController: GetStreamsPageController;

  constructor(
    query: Amity.StreamLiveCollection,
    cacheKey: string[],
    notifyChange: (params: Amity.LiveCollectionNotifyParams) => void,
    paginationController: GetStreamsPageController,
  ) {
    super(query, cacheKey);
    this.notifyChange = notifyChange;
    this.paginationController = paginationController;
  }

  // eslint-disable-next-line class-methods-use-this
  saveToMainDB(response: Amity.StreamPayload) {
    const client = getActiveClient();
    const cachedAt = client.cache && Date.now();

    if (client.cache) {
      ingestInCache(response, { cachedAt });
    }
  }

  appendToQueryStream(
    response: Amity.StreamPayload & Partial<Amity.Pagination>,
    direction: Amity.LiveCollectionPageDirection,
    refresh = false,
  ) {
    if (refresh) {
      pushToCache(this.cacheKey, {
        data: response.videoStreamings.map(getResolver('stream')),
        query: this.query,
      });
    } else {
      const collection = pullFromCache<Amity.StreamLiveCollectionCache>(this.cacheKey)?.data;

      const messages = collection?.data ?? [];

      pushToCache(this.cacheKey, {
        ...collection,
        data:
          direction === 'next'
            ? [...new Set([...messages, ...response.videoStreamings.map(getResolver('stream'))])]
            : [...new Set([...response.videoStreamings.map(getResolver('stream')), ...messages])],
      });
    }
  }

  reactor(action: string) {
    return (payload: Amity.InternalStream) => {
      const collection = pullFromCache<Amity.StreamLiveCollectionCache>(this.cacheKey)?.data;
      if (!collection) return;

      collection.data = [...new Set([payload.streamId, ...collection.data])];

      pushToCache(this.cacheKey, collection);

      this.notifyChange({ origin: Amity.LiveDataOrigin.EVENT, loading: false });
    };
  }

  subscribeRTE(
    createSubscriber: {
      fn: (reactor: Amity.Listener<Amity.InternalStream>) => Amity.Unsubscriber;
      action: string;
    }[],
  ) {
    return createSubscriber.map(subscriber => subscriber.fn(this.reactor(subscriber.action)));
  }
}
