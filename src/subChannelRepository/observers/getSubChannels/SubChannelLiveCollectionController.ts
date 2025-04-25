/* eslint-disable no-use-before-define */
import hash from 'object-hash';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
import { pullFromCache, pushToCache } from '~/cache/api';
import { SubChannelPaginationController } from './SubChannelPaginationController';
import { SubChannelQueryStreamController } from './SubChannelQueryStreamController';
import {
  onSubChannelCreated,
  onSubChannelDeleted,
  onSubChannelUpdated,
} from '~/subChannelRepository/events';
import {
  onMessageUpdated,
  onMessageDeleted,
  onMessageCreatedMqtt,
  onMessageCreatedLocal,
} from '~/messageRepository/events';
import { onSubChannelMarkerFetched, onSubChannelMarkerUpdated } from '~/marker/events';
import { convertEventPayload } from '~/utils/event';
import { filterByPropEquality, sortByLastActivity } from '~/core/query';
import { getActiveClient } from '~/client';
import {
  getSubChannelMessagePreview,
  getSubChannelMessagePreviewWithUser,
  handleMessageCreatedOnSubChannel,
  handleMessageUpdatedOnSubChannel,
} from '~/messagePreview/utils';
import { getSubChannel } from '~/subChannelRepository/api/getSubChannel';
import { prepareSubChannelPayload } from '~/subChannelRepository/utils';
import { onSubChannelFetched } from '~/subChannelRepository/events/onSubChannelFetched';
import { onSubChannelUnreadUpdatedLocal } from '~/marker/events/onSubChannelUnreadUpdatedLocal';
import { convertDateStringToTimestamp } from '~/utils/dateTime';

export class SubChannelLiveCollectionController extends LiveCollectionController<
  'subChannel',
  Amity.SubChannelLiveCollection,
  Amity.SubChannel,
  SubChannelPaginationController
> {
  private queryStreamController: SubChannelQueryStreamController;

  private query: Amity.SubChannelLiveCollection;

  constructor(
    query: Amity.SubChannelLiveCollection,
    callback: Amity.LiveCollectionCallback<Amity.SubChannel>,
  ) {
    const queryStreamId = hash(query);
    const cacheKey = ['subChannel', 'collection', queryStreamId];
    const paginationController = new SubChannelPaginationController(query);

    super(paginationController, queryStreamId, cacheKey, callback);

    this.query = query;
    this.queryStreamController = new SubChannelQueryStreamController(
      this.query,
      this.cacheKey,
      this.notifyChange.bind(this),
      prepareSubChannelPayload,
    );
    this.callback = callback.bind(this);
    this.loadPage({ initial: true });
  }

  protected setup() {
    const collection = pullFromCache<Amity.SubChannelLiveCollectionCache>(this.cacheKey)?.data;
    if (!collection) {
      pushToCache(this.cacheKey, {
        data: [],
      });
    }
  }

  protected async persistModel(response: Amity.SubChannelPayload & Amity.Pagination) {
    await this.queryStreamController.saveToMainDB(response);
  }

  protected persistQueryStream({
    response,
    direction,
    refresh,
  }: Amity.LiveCollectionPersistQueryStreamParams<'subChannel'>) {
    this.queryStreamController.appendToQueryStream(response, direction, refresh);
  }

  startSubscription() {
    return this.queryStreamController.subscribeRTE([
      { fn: onSubChannelFetched, action: 'onCreate' },
      { fn: onSubChannelCreated, action: 'onCreate' },
      { fn: onSubChannelDeleted, action: 'onDelete' },
      {
        fn: callback => {
          return onSubChannelUpdated(async (subChannel: Amity.SubChannel) => {
            if (!this.isRelatedCollection(subChannel.subChannelId)) return;
            const client = getActiveClient();

            const messagePreviewSetting = await client.getMessagePreviewSetting(false);
            if (messagePreviewSetting !== Amity.MessagePreviewSetting.NO_MESSAGE_PREVIEW) {
              const messagePreview = getSubChannelMessagePreview(subChannel.subChannelId);

              if (
                messagePreview?.subChannelId === subChannel.subChannelId &&
                convertDateStringToTimestamp(subChannel.updatedAt!) >
                  convertDateStringToTimestamp(messagePreview.subChannelUpdatedAt)
              ) {
                pushToCache(['messagePreviewSubChannel', 'get', subChannel.subChannelId], {
                  ...messagePreview,
                  subChannelName: subChannel.displayName,
                  subChannelUpdatedAt: subChannel.updatedAt,
                });
              }
            }

            callback(subChannel);
          });
        },
        action: 'onUpdate',
      },
      {
        fn: convertEventPayload(
          (callback: Amity.Listener<Amity.InternalMessage>) => {
            return onMessageCreatedMqtt(async message => {
              if (!this.isRelatedCollection(message.subChannelId)) return;
              //  Update related cache including message preview and subChannel cache (lastActivity, messagePreviewId)
              await handleMessageCreatedOnSubChannel(message);
              callback(message);
            });
          },
          'subChannelId',
          'subChannel',
        ),
        action: 'onUpdate',
      },
      {
        fn: convertEventPayload(
          (callback: Amity.Listener<Amity.InternalMessage>) => {
            return onMessageCreatedLocal(async message => {
              if (!this.isRelatedCollection(message.subChannelId)) return;
              //  Update related cache including message preview and subChannel cache (lastActivity, messagePreviewId)
              await handleMessageCreatedOnSubChannel(message);
              callback(message);
            });
          },
          'subChannelId',
          'subChannel',
        ),
        action: 'onUpdate',
      },
      {
        fn: callback => {
          return onSubChannelMarkerUpdated((subChannelMarkers: Amity.SubChannelMarker[]) => {
            const subChannelWithMarkerUpdated =
              subChannelMarkers
                .map(
                  ({ feedId }) => pullFromCache<Amity.SubChannel>(['subChannel', 'get', feedId])!,
                )
                .filter(Boolean)
                .map(({ data }) => data) ?? [];

            if (subChannelWithMarkerUpdated.length === 0) return;
            callback(subChannelWithMarkerUpdated);
          });
        },
        action: 'onUpdate',
      },
      {
        fn: convertEventPayload(onSubChannelMarkerFetched, 'feedId', 'subChannel'),
        action: 'onUpdate',
      },
      {
        fn: convertEventPayload(
          (callback: Amity.Listener<Amity.InternalMessage>) => {
            const updateMessagePreview = async (message: Amity.InternalMessage) => {
              const client = getActiveClient();
              const messagePreviewSetting = await client.getMessagePreviewSetting(false);

              if (messagePreviewSetting === Amity.MessagePreviewSetting.NO_MESSAGE_PREVIEW) return;

              const collection = pullFromCache<Amity.SubChannelLiveCollectionCache>(
                this.cacheKey,
              )?.data;

              if (!collection || !collection.data.includes(message.subChannelId)) return;

              handleMessageUpdatedOnSubChannel(message);

              callback(message);
            };
            return onMessageUpdated(updateMessagePreview);
          },
          'subChannelId',
          'subChannel',
        ),
        action: 'onUpdate',
      },
      {
        fn: convertEventPayload(
          (callback: Amity.Listener<Amity.InternalMessage>) => {
            const updateMessagePreview = async (message: Amity.InternalMessage) => {
              const client = getActiveClient();
              const messagePreviewSetting = await client.getMessagePreviewSetting(false);

              if (messagePreviewSetting === Amity.MessagePreviewSetting.NO_MESSAGE_PREVIEW) return;

              if (!this.isRelatedCollection(message.subChannelId)) return;

              if (
                messagePreviewSetting ===
                Amity.MessagePreviewSetting.MESSAGE_PREVIEW_NOT_INCLUDE_DELETED
              ) {
                await getSubChannel(message.subChannelId);
              } else {
                await handleMessageUpdatedOnSubChannel(message);
              }

              callback(message);
            };

            return onMessageDeleted(updateMessagePreview);
          },
          'subChannelId',
          'subChannel',
        ),
        action: 'onUpdate',
      },
      {
        fn: convertEventPayload(onSubChannelUnreadUpdatedLocal, 'subChannelId', 'subChannel'),
        action: 'onUpdate',
      },
    ]);
  }

  notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams) {
    const collection = pullFromCache<Amity.SubChannelLiveCollectionCache>(this.cacheKey)?.data;
    if (!collection) return;

    const data = this.applyFilter(
      collection.data
        .map(subChannelId => pullFromCache<Amity.SubChannel>(['subChannel', 'get', subChannelId])!)
        .filter(Boolean)
        .map(({ data }) => data)
        .map(getSubChannelMessagePreviewWithUser) ?? [],
    );

    if (!this.shouldNotify(data) && origin === 'event') return;

    this.callback({
      onNextPage: () => this.loadPage({ direction: Amity.LiveCollectionPageDirection.NEXT }),
      data,
      hasNextPage: !!this.paginationController.getNextToken(),
      loading,
      error,
    });
  }

  applyFilter(data: Amity.SubChannel[]) {
    let subChannels = data;

    if (!this.query.includeDeleted) {
      subChannels = filterByPropEquality(data, 'isDeleted', false);
    }

    subChannels.sort(sortByLastActivity);

    return subChannels;
  }

  isRelatedCollection(subChannelId: string) {
    const collection = pullFromCache<Amity.SubChannelLiveCollectionCache>(this.cacheKey)?.data;
    return collection && collection.data.includes(subChannelId);
  }
}
