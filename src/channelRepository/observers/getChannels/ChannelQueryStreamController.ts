/* eslint-disable no-use-before-define */
import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { pullFromCache, pushToCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { getResolver } from '~/core/model';
import { getActiveClient } from '~/client';

import { ChannelPaginationController } from './ChannelPaginationController';
import { ChannelPaginationNoPageController } from './ChannelPagnationNoPageController';

export class ChannelQueryStreamController extends QueryStreamController<
  Amity.ChannelPayload,
  Amity.ChannelLiveCollection
> {
  private notifyChange: (params: Amity.LiveCollectionNotifyParams) => void;

  private preparePayload: (
    response: Amity.ChannelPayload,
  ) => Promise<Amity.ProcessedChannelPayload>;

  private paginationController: ChannelPaginationController | ChannelPaginationNoPageController;

  constructor(
    query: Amity.ChannelLiveCollection,
    cacheKey: string[],
    notifyChange: (params: Amity.LiveCollectionNotifyParams) => void,
    preparePayload: (response: Amity.ChannelPayload) => Promise<Amity.ProcessedChannelPayload>,
    paginationController: ChannelPaginationController | ChannelPaginationNoPageController,
  ) {
    super(query, cacheKey);
    this.notifyChange = notifyChange;
    this.preparePayload = preparePayload;
    this.paginationController = paginationController;
  }

  async saveToMainDB(response: Amity.ChannelPayload) {
    const processedPayload = await this.preparePayload(response);

    const client = getActiveClient();
    const cachedAt = client.cache && Date.now();

    if (client.cache) {
      ingestInCache(processedPayload, { cachedAt });
    }
  }

  appendToQueryStream(
    response: Amity.ChannelPayload & Partial<Amity.Pagination>,
    direction: Amity.LiveCollectionPageDirection,
    refresh = false,
  ) {
    if (refresh) {
      pushToCache(this.cacheKey, {
        data: response.channels.map(getResolver('channel')),
      });
    } else {
      const collection = pullFromCache<Amity.ChannelLiveCollectionCache>(this.cacheKey)?.data;
      const channels = collection?.data ?? [];

      pushToCache(this.cacheKey, {
        ...collection,
        data: [...new Set([...channels, ...response.channels.map(getResolver('channel'))])],
      });
    }
  }

  reactor(action: Amity.ChannelActionType) {
    return (payload: Amity.StaticInternalChannel | Amity.StaticInternalChannel[]) => {
      const collection = pullFromCache<Amity.ChannelLiveCollectionCache>(this.cacheKey)?.data;
      if (!collection) return;

      if (this.paginationController instanceof ChannelPaginationNoPageController)
        return this.notifyChange({ origin: Amity.LiveDataOrigin.EVENT, loading: false });

      if (
        [
          Amity.ChannelActionType.OnCreate,
          Amity.ChannelActionType.OnJoin,
          Amity.ChannelActionType.OnResolveChannel,
        ].includes(action)
      ) {
        if (Array.isArray(payload)) {
          collection.data = [
            ...new Set([...payload.map(getResolver('channel')), ...collection.data]),
          ];
        } else collection.data = [...new Set([payload.channelInternalId, ...collection.data])];
      }

      pushToCache(this.cacheKey, collection);
      this.notifyChange({ origin: Amity.LiveDataOrigin.EVENT, loading: false });
    };
  }

  subscribeRTE(
    createSubscriber: {
      fn: (
        reactor: Amity.Listener<Amity.StaticInternalChannel | Amity.StaticInternalChannel[]>,
      ) => Amity.Unsubscriber;
      action: Amity.ChannelActionType;
    }[],
  ) {
    return createSubscriber.map(subscriber => subscriber.fn(this.reactor(subscriber.action)));
  }
}
