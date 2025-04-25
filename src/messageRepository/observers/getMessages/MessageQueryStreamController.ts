/* eslint-disable no-use-before-define */
import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { pullFromCache, pushToCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { getActiveClient } from '~/client';
import { MessagePaginationController } from './MessagePaginationController';
import { getResolver } from '~/core/model';

export class MessageQueryStreamController extends QueryStreamController<
  Amity.MessagePayload,
  Amity.MessagesLiveCollection
> {
  private notifyChange: (params: Amity.LiveCollectionNotifyParams) => void;

  private preparePayload: (
    response: Amity.MessagePayload,
  ) => Promise<Amity.ProcessedMessagePayload>;

  private paginationController: MessagePaginationController;

  constructor(
    query: Amity.MessagesLiveCollection,
    cacheKey: string[],
    notifyChange: (params: Amity.LiveCollectionNotifyParams) => void,
    preparePayload: (response: Amity.MessagePayload) => Promise<Amity.ProcessedMessagePayload>,
    paginationController: MessagePaginationController,
  ) {
    super(query, cacheKey);

    this.notifyChange = notifyChange;
    this.preparePayload = preparePayload;
    this.paginationController = paginationController;
  }

  async saveToMainDB(response: Amity.MessagePayload) {
    const processedPayload = await this.preparePayload(response);

    const client = getActiveClient();
    const cachedAt = client.cache && Date.now();

    if (client.cache) {
      ingestInCache(processedPayload, { cachedAt });
    }
  }

  appendToQueryStream(
    response: Amity.MessagePayload & Partial<Amity.Pagination>,
    direction: Amity.LiveCollectionPageDirection,
    refresh = false,
  ) {
    if (refresh) {
      pushToCache(this.cacheKey, {
        data: response.messages.map(getResolver('message')),
        query: this.query,
      });
    } else {
      const collection = pullFromCache<Amity.MessageLiveCollectionCache>(this.cacheKey)?.data;

      const messages = collection?.data ?? [];

      pushToCache(this.cacheKey, {
        ...collection,
        data:
          direction === 'next'
            ? [...new Set([...messages, ...response.messages.map(getResolver('message'))])]
            : [...new Set([...response.messages.map(getResolver('message')), ...messages])],
      });
    }
  }

  reactor(action: string) {
    return (payload: Amity.InternalMessage) => {
      if (action === 'onCreate') {
        const collection = pullFromCache<Amity.MessageLiveCollectionCache>(this.cacheKey)?.data;
        const { referenceId } = payload;

        if (!collection) return;
        if (this.query.subChannelId !== payload?.subChannelId || !collection) return;

        if (this.query.type && this.query.type !== payload.dataType) return;

        if (
          this.query.excludingTags &&
          this.query.excludingTags?.some(value => payload.tags?.includes(value))
        )
          return;

        if (!!this.query.hasFlags !== !!payload.flagCount) return;

        if (this.query.parentId && this.query.parentId !== payload.parentId) return;

        if (
          this.query.hasOwnProperty('includeDeleted') &&
          !this.query.includeDeleted &&
          payload.isDeleted
        )
          return;

        if (
          this.query.includingTags &&
          !this.query.includingTags?.some(value => payload.tags?.includes(value))
        )
          return;

        if (
          (!this.query.sortBy || this.query.sortBy === 'segmentDesc') &&
          !this.paginationController.getPrevToken()
        ) {
          collection.data = [...new Set([referenceId ?? payload.messageId, ...collection.data])];
        }

        if (this.query.sortBy === 'segmentAsc' && !this.paginationController.getNextToken()) {
          collection.data = [...new Set([...collection.data, referenceId ?? payload.messageId])];
        }

        pushToCache(this.cacheKey, collection);
      }

      this.notifyChange({ origin: Amity.LiveDataOrigin.EVENT, loading: false });
    };
  }

  subscribeRTE(
    createSubscriber: {
      fn: (reactor: Amity.Listener<Amity.InternalMessage>) => Amity.Unsubscriber;
      action: string;
    }[],
  ) {
    return createSubscriber.map(subscriber => subscriber.fn(this.reactor(subscriber.action)));
  }
}
