import hash from 'object-hash';
import { pullFromCache, pushToCache } from '~/cache/api';
import {
  onMessageCreatedLocal,
  onMessageCreatedMqtt,
  onMessageDeleted,
  onMessageFlagCleared,
  onMessageFlagged,
  onMessageReactionAdded,
  onMessageReactionRemoved,
  onMessageUnflagged,
  onMessageUpdated,
} from '~/messageRepository/events';
import { convertEventPayload } from '~/utils/event';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
import { onMessageMarked, onMessageMarkerFetched } from '~/marker/events';
import { filterByPropEquality } from '~/core/query';
import { prepareMessagePayload } from '~/messageRepository/utils';
import { LinkedObject } from '~/utils/linkedObject';
import { MessageQueryStreamController } from './MessageQueryStreamController';
import { MessagePaginationController } from './MessagePaginationController';
import { getMessageFromMainDB } from '~/messageRepository/utils/getMessageFromMainDB';

export class MessageLiveCollectionController extends LiveCollectionController<
  'message',
  Amity.MessagesLiveCollection,
  Amity.Message,
  MessagePaginationController
> {
  private queryStreamController: MessageQueryStreamController;

  private query: Amity.MessagesLiveCollection;

  constructor(
    query: Amity.MessagesLiveCollection,
    callback: Amity.LiveCollectionCallback<Amity.Message>,
  ) {
    const queryStreamId = hash(query);
    const cacheKey = ['message', 'collection', queryStreamId];
    const paginationController = new MessagePaginationController(query);

    super(paginationController, queryStreamId, cacheKey, callback);

    this.query = query;
    this.queryStreamController = new MessageQueryStreamController(
      this.query,
      this.cacheKey,
      this.notifyChange.bind(this),
      prepareMessagePayload,
      this.paginationController,
    );

    this.callback = callback.bind(this);
    this.loadPage({ initial: true });
  }

  startSubscription() {
    return this.queryStreamController.subscribeRTE([
      { fn: onMessageCreatedMqtt, action: 'onCreate' },
      { fn: onMessageCreatedLocal, action: 'onCreate' },
      { fn: onMessageDeleted, action: 'onDelete' },
      { fn: onMessageUpdated, action: 'onUpdate' },
      { fn: onMessageFlagged, action: 'onFlagged' },
      { fn: onMessageUnflagged, action: 'onUnflagged' },
      { fn: onMessageFlagCleared, action: 'onFlagCleared' },
      { fn: onMessageReactionAdded, action: 'onReactionAdded' },
      { fn: onMessageReactionRemoved, action: 'onReactionRemoved' },
      {
        fn: convertEventPayload(onMessageMarkerFetched, 'contentId', 'message'),
        action: 'onUpdate',
      },
      { fn: convertEventPayload(onMessageMarked, 'contentId', 'message'), action: 'onUpdate' },
    ]);
  }

  notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams) {
    const collection = pullFromCache<Amity.MessageLiveCollectionCache>(this.cacheKey)?.data;

    if (!collection) return;

    const data = this.applyFilter(
      collection.data
        .map(messageId => getMessageFromMainDB(messageId)!)
        .filter(Boolean)
        .map(message => LinkedObject.message(message)) ?? [],
    );

    if (!this.shouldNotify(data) && origin === 'event') return;

    this.callback({
      onNextPage: () => this.loadPage({ direction: Amity.LiveCollectionPageDirection.NEXT }),
      onPrevPage: () => this.loadPage({ direction: Amity.LiveCollectionPageDirection.PREV }),
      data,
      hasNextPage: !!this.paginationController.getNextToken(),
      hasPrevPage: !!this.paginationController.getPrevToken(),
      loading,
      error,
    });
  }

  applyFilter(data: Amity.Message[]) {
    let messages = data;

    /*
     * for cases when message is deleted via RTE, this flag is used to get
     * items from cache that are !deleted
     */
    if (!this.query.includeDeleted) {
      messages = filterByPropEquality(messages, 'isDeleted', false);
    }

    messages = messages.sort((message1, message2) => {
      if (this.query.sortBy === 'segmentAsc') {
        return message1.channelSegment - message2.channelSegment;
      }
      if (this.query.sortBy === 'segmentDesc') {
        return message2.channelSegment - message1.channelSegment;
      }
      return 0;
    });

    return messages;
  }

  protected setup() {
    const collection = pullFromCache<Amity.MessageLiveCollectionCache>(this.cacheKey)?.data;
    if (!collection) {
      pushToCache(this.cacheKey, {
        data: [],
        query: this.query,
      });
    }
  }

  protected async persistModel(response: Amity.MessagePayload & Amity.Pagination) {
    await this.queryStreamController.saveToMainDB(response);
  }

  protected persistQueryStream({
    response,
    direction,
    refresh,
  }: Amity.LiveCollectionPersistQueryStreamParams<'message'>) {
    this.queryStreamController.appendToQueryStream(response, direction, refresh);
  }
}
