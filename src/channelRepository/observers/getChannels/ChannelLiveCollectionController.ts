/* eslint-disable no-use-before-define */
import hash from 'object-hash';
import { pullFromCache, pushToCache } from '~/cache/api';
import { ChannelPaginationController } from './ChannelPaginationController';
import { ChannelQueryStreamController } from './ChannelQueryStreamController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
import {
  onChannelCreated,
  onChannelDeleted,
  onChannelJoined,
  onChannelLeft,
  onChannelMemberAdded,
  onChannelMemberRemoved,
  onChannelMuted,
  onChannelUpdated,
} from '~/channelRepository/events';
import {
  onMessageCreatedLocal,
  onMessageCreatedMqtt,
} from '~/messageRepository/events/onMessageCreated';
import { onMessageUpdated } from '~/messageRepository/events/onMessageUpdated';
import { onMessageDeleted } from '~/messageRepository/events/onMessageDeleted';
import { onSubChannelUpdated } from '~/subChannelRepository/events/onSubChannelUpdated';
import { onSubChannelDeleted } from '~/subChannelRepository/events/onSubChannelDeleted';
import { onChannelFetched } from '~/channelRepository/events/onChannelFetched';
import { convertEventPayload } from '~/utils/event';
import { onChannelMarkerFetched } from '~/marker/events';
import {
  filterByChannelMembership,
  filterByPropEquality,
  filterByStringComparePartially,
  sortByDisplayName,
  sortByFirstCreated,
  sortByLastActivity,
  sortByLastCreated,
} from '~/core/query';
import { updateChannelCache } from '~/channelRepository/utils/updateChannelCache';
import { onChannelMarkerUpdated } from '~/marker/events/onChannelMarkerUpdated';
import {
  getChannelMessagePreview,
  getChannelMessagePreviewWithUser,
  handleMessageCreated,
  handleMessageUpdated,
  handleSubChannelUpdated,
} from '~/messagePreview/utils';
import { getChannel } from '~/channelRepository/internalApi/getChannel';
import { getActiveClient } from '~/client';
import { prepareChannelPayload } from '~/channelRepository/utils';
import { ChannelPaginationNoPageController } from './ChannelPagnationNoPageController';
import { PaginationController } from '~/core/liveCollection/PaginationController';
import { onSubChannelCreated } from '~/subChannelRepository';

import ObjectResolverEngine from '~/client/utils/ObjectResolver/objectResolverEngine';
import { prepareUnreadCountInfo } from '~/channelRepository/utils/prepareUnreadCountInfo';
import { resolveUnreadInfoOnChannelEvent } from '~/channelRepository/utils/resolveUnreadInfoOnChannelEvent';
import { onChannelResolved } from '~/channelRepository/events/onChannelResolved';
import { onUserMessageFeedMarkerResolved } from '~/marker/events/onUserMessageFeedMarkerResolved';
import { onChannelUnreadInfoUpdatedLocal } from '~/marker/events/onChannelUnreadInfoUpdatedLocal';
import { constructChannelObject } from '~/channelRepository/utils/constructChannelObject';
import { onChannelUnreadUpdatedLocal } from '~/channelRepository/events/onChannelUnreadUpdatedLocal';

export class ChannelLiveCollectionController extends LiveCollectionController<
  'channel',
  Amity.ChannelLiveCollection,
  Amity.Channel,
  ChannelPaginationController | ChannelPaginationNoPageController
> {
  private queryStreamController: ChannelQueryStreamController;

  private query: Amity.ChannelLiveCollection;

  constructor(
    query: Amity.ChannelLiveCollection,
    callback: Amity.LiveCollectionCallback<Amity.Channel>,
  ) {
    const queryStreamId = hash(query);
    const cacheKey = ['channel', 'collection', queryStreamId];
    const paginationController = ChannelLiveCollectionController.getPaginationController(query);

    super(paginationController, queryStreamId, cacheKey, callback);

    this.query = query;
    this.queryStreamController = new ChannelQueryStreamController(
      this.query,
      this.cacheKey,
      this.notifyChange.bind(this),
      async (channel: Amity.ChannelPayload) => {
        try {
          const client = getActiveClient();
          if (client.isUnreadCountEnabled && client.getMarkerSyncConsistentMode()) {
            await prepareUnreadCountInfo(channel);
          }
        } catch (e) {
          console.error('Error while preparing unread count info', e);
        }
        return prepareChannelPayload(channel);
      },
      paginationController,
    );

    this.paginationController = paginationController;
    this.callback = callback.bind(this);
    this.loadPage({ initial: true });
  }

  protected setup() {
    const collection = pullFromCache<Amity.ChannelLiveCollectionCache>(this.cacheKey)?.data;
    if (!collection) {
      pushToCache(this.cacheKey, {
        data: [],
        params: {},
      });
    }
  }

  protected async persistModel(response: Amity.ChannelPayload & Amity.Pagination) {
    await this.queryStreamController.saveToMainDB(response);
  }

  protected persistQueryStream({
    response,
    direction,
    refresh,
  }: Amity.LiveCollectionPersistQueryStreamParams<'channel'>) {
    this.queryStreamController.appendToQueryStream(response, direction, refresh);
  }

  startSubscription() {
    return this.queryStreamController.subscribeRTE(this.getSubscriptions());
  }

  notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams) {
    const collection = pullFromCache<Amity.ChannelLiveCollectionCache>(this.cacheKey)?.data;
    if (!collection) return;

    let data: Amity.Channel[] =
      collection.data
        .map(
          channelId => pullFromCache<Amity.StaticInternalChannel>(['channel', 'get', channelId])!,
        )
        .filter(Boolean)
        .map(({ data }) => data)
        .map(constructChannelObject) ?? [];

    if (this.paginationController instanceof ChannelPaginationController) {
      data = this.applyFilter(data);
    }

    if (!this.shouldNotify(data) && origin === 'event') return;

    this.callback({
      onNextPage:
        this.paginationController instanceof ChannelPaginationController
          ? () => this.loadPage({ direction: Amity.LiveCollectionPageDirection.NEXT })
          : undefined,
      data,
      hasNextPage:
        this.paginationController instanceof ChannelPaginationController
          ? !!this.paginationController.getNextToken()
          : false,
      loading,
      error,
    });
  }

  private applyFilter(data: Amity.Channel[]) {
    const { userId } = getActiveClient();

    let channels = data;

    channels = filterByPropEquality(channels, 'isDeleted', this.query.isDeleted);

    channels = filterByStringComparePartially(channels, 'displayName', this.query.displayName);

    if (this.query.types) {
      channels = channels.filter(c => this.query.types?.includes(c.type));
    }

    if (this.query.tags) {
      channels = channels.filter(c => c.tags?.some(t => this.query.tags?.includes(t)));
    }

    if (this.query.excludeTags) {
      channels = channels.filter(c => !c.tags?.some(t => this.query.excludeTags?.includes(t)));
    }

    // userId is required to be able to filter channel by current active user
    if (this.query.membership && userId) {
      channels = filterByChannelMembership(channels, this.query.membership, userId);
    }

    switch (this.query.sortBy) {
      case 'firstCreated':
        channels = channels.sort(sortByFirstCreated);
        break;

      case 'lastCreated':
        channels = channels.sort(sortByLastCreated);
        break;

      case 'displayName':
        /*
         * The server returns channels with empty | null displayName's first before
         * returning sorted list of channels with displayNames
         *
         * This section needs to be updated as displayNames can be null as well
         */
        channels = channels
          // this needs to be aligned with the backend data type
          .map(
            c =>
              (c.displayName ? c : { ...c, displayName: '' }) as Amity.Channel & {
                displayName: string;
              },
          )
          .sort(sortByDisplayName);
        break;

      default:
        channels = channels.sort(sortByLastActivity);
        break;
    }
    return channels;
  }

  private shouldAbort(targetChannelId: string) {
    const collection = pullFromCache<Amity.ChannelLiveCollectionCache>(this.cacheKey)?.data;
    if (!collection) return true;

    const channelId = collection?.data?.find(channel => channel === targetChannelId);
    return !channelId;
  }

  private static getMessagePreviewSetting() {
    const client = getActiveClient();
    return client.getMessagePreviewSetting(false);
  }

  private static getPaginationController(query: Amity.ChannelLiveCollection) {
    if (query.channelIds && query.channelIds.length > 0) {
      return new ChannelPaginationNoPageController(query);
    }

    return new ChannelPaginationController(query);
  }

  private getSubscriptions() {
    const subscriptions = [
      {
        fn: convertEventPayload(
          (callback: Amity.Listener<Amity.InternalMessage>) => {
            return onMessageCreatedMqtt(message => {
              const objectResolverEngine = ObjectResolverEngine.getInstance();

              const cachedSubChannelUnread = pullFromCache<Amity.SubChannelUnreadInfo>([
                'subChannelUnreadInfo',
                'get',
                message.subChannelId,
              ])?.data;

              if (!cachedSubChannelUnread)
                objectResolverEngine.resolve(
                  message.subChannelId,
                  Amity.ReferenceType.USER_MESSAGE_FEED_MARKER,
                );

              const channelCache = pullFromCache<Amity.StaticInternalChannel>([
                'channel',
                'get',
                message.channelId,
              ])?.data;

              if (!channelCache) {
                // channelId from message event payload is channelInternalId
                objectResolverEngine.resolve(message.channelId, Amity.ReferenceType.CHANNEL);
              } else {
                updateChannelCache(channelCache, {
                  lastActivity: message.createdAt,
                });

                callback(message);
              }
            });
          },
          'channelId',
          'channel',
        ),
        action: Amity.ChannelActionType.OnUpdate,
      },
      {
        fn: convertEventPayload(
          (callback: Amity.Listener<Amity.InternalMessage>) => {
            return onMessageCreatedLocal(message => {
              const cacheData = pullFromCache<Amity.StaticInternalChannel>([
                'channel',
                'get',
                message.channelId,
              ])?.data;

              if (!cacheData) return;

              updateChannelCache(cacheData, {
                lastActivity: message.createdAt,
              });

              callback(message);
            });
          },
          'channelId',
          'channel',
        ),
        action: Amity.ChannelActionType.OnUpdate,
      },
      { fn: onChannelDeleted, action: Amity.ChannelActionType.OnDelete },
      { fn: onChannelUpdated, action: Amity.ChannelActionType.OnUpdate },
      { fn: onChannelMuted, action: Amity.ChannelActionType.OnMute },
      {
        fn: (callback: Amity.Listener<Amity.StaticInternalChannel>) => {
          return onChannelJoined(channel => {
            resolveUnreadInfoOnChannelEvent(channel);

            callback(channel);
          });
        },
        action: Amity.ChannelActionType.OnJoin,
      },
      {
        fn: (reactor: Amity.Listener<Amity.StaticInternalChannel>) => {
          const callback = (
            channel: Amity.StaticInternalChannel,
            member: Amity.Membership<'channel'>,
          ) => {
            const { userId } = getActiveClient();
            // if query for channel member and user is not a member, remove channelId from curren collection
            if (this.query.membership === 'member' && userId === member.userId) {
              const collection = pullFromCache<Amity.ChannelLiveCollectionCache>(
                this.cacheKey,
              )?.data;

              pushToCache(this.cacheKey, {
                ...collection,
                data: collection?.data.filter(c => c !== channel.channelId) ?? [],
              });
            }
            return reactor(channel);
          };
          return onChannelLeft(callback);
        },
        action: Amity.ChannelActionType.OnLeft,
      },
      { fn: onChannelMemberAdded, action: Amity.ChannelActionType.OnMemberAdded },
      { fn: onChannelMemberRemoved, action: Amity.ChannelActionType.OnMemberRemoved },
      {
        fn: convertEventPayload(onChannelMarkerFetched, 'entityId', 'channel'),
        action: Amity.ChannelActionType.OnUpdate,
      },
      {
        fn: convertEventPayload(onChannelMarkerUpdated, 'entityId', 'channel'),
        action: Amity.ChannelActionType.OnUpdate,
      },
      {
        fn: convertEventPayload(
          (callback: Amity.Listener<Amity.InternalMessage>) => {
            const updateMessagePreview = async (message: Amity.InternalMessage) => {
              const messagePreviewSetting =
                await ChannelLiveCollectionController.getMessagePreviewSetting();
              if (messagePreviewSetting === Amity.MessagePreviewSetting.NO_MESSAGE_PREVIEW) return;

              handleMessageCreated(message);

              if (this.shouldAbort(message.channelId)) return;

              const channel = pullFromCache<Amity.StaticInternalChannel>([
                'channel',
                'get',
                message.channelId,
              ])?.data;
              if (!channel) return;

              updateChannelCache(channel, {
                messagePreviewId: message.messageId,
              });

              callback(message);
            };

            return onMessageCreatedMqtt(updateMessagePreview);
          },

          'channelId',
          'channel',
        ),
        action: Amity.ChannelActionType.OnUpdate,
      },
      {
        fn: convertEventPayload(
          (callback: Amity.Listener<Amity.InternalMessage>) => {
            const updateMessagePreview = async (message: Amity.InternalMessage) => {
              const messagePreviewSetting =
                await ChannelLiveCollectionController.getMessagePreviewSetting();
              if (messagePreviewSetting === Amity.MessagePreviewSetting.NO_MESSAGE_PREVIEW) return;

              handleMessageCreated(message);

              if (this.shouldAbort(message.channelId)) return;

              const channel = pullFromCache<Amity.StaticInternalChannel>([
                'channel',
                'get',
                message.channelId,
              ])?.data;
              if (!channel) return;

              updateChannelCache(channel, {
                messagePreviewId: message.messageId,
              });

              callback(message);
            };

            return onMessageCreatedLocal(updateMessagePreview);
          },

          'channelId',
          'channel',
        ),
        action: Amity.ChannelActionType.OnUpdate,
      },
      {
        fn: convertEventPayload(
          (callback: Amity.Listener<Amity.InternalMessage>) => {
            const updateMessagePreview = async (message: Amity.InternalMessage) => {
              const messagePreviewSetting =
                await ChannelLiveCollectionController.getMessagePreviewSetting();
              if (messagePreviewSetting === Amity.MessagePreviewSetting.NO_MESSAGE_PREVIEW) return;

              handleMessageUpdated(message);

              if (this.shouldAbort(message.channelId)) return;

              callback(message);
            };

            return onMessageUpdated(updateMessagePreview);
          },
          'channelId',
          'channel',
        ),
        action: Amity.ChannelActionType.OnUpdate,
      },
      {
        fn: convertEventPayload(
          (callback: Amity.Listener<Amity.InternalMessage>) => {
            const updateMessagePreview = async (message: Amity.InternalMessage) => {
              const messagePreviewSetting =
                await ChannelLiveCollectionController.getMessagePreviewSetting();

              if (messagePreviewSetting === Amity.MessagePreviewSetting.NO_MESSAGE_PREVIEW) return;

              if (
                messagePreviewSetting ===
                Amity.MessagePreviewSetting.MESSAGE_PREVIEW_INCLUDE_DELETED
              )
                await handleMessageUpdated(message);

              if (this.shouldAbort(message.channelId)) return;

              if (
                messagePreviewSetting ===
                Amity.MessagePreviewSetting.MESSAGE_PREVIEW_NOT_INCLUDE_DELETED
              ) {
                await getChannel(message.channelId);
              }

              callback(message);
            };

            return onMessageDeleted(updateMessagePreview);
          },
          'channelId',
          'channel',
        ),
        action: Amity.ChannelActionType.OnUpdate,
      },
      {
        fn: convertEventPayload(
          (callback: Amity.Listener<Amity.SubChannel>) => {
            const updateMessagePreview = async (subChannel: Amity.SubChannel) => {
              const collections = pullFromCache<Amity.ChannelLiveCollectionCache>(
                this.cacheKey,
              )?.data;
              if (!collections) return;

              const channelId = collections.data.find(channel => {
                const messagePreviewCache = getChannelMessagePreview(channel);
                return messagePreviewCache?.subChannelId === subChannel.subChannelId;
              });
              if (!channelId) return;

              await getChannel(subChannel.channelId);

              callback(subChannel);
            };

            return onSubChannelDeleted(updateMessagePreview);
          },
          'channelId',
          'channel',
        ),
        action: Amity.ChannelActionType.OnUpdate,
      },
      {
        fn: convertEventPayload(
          (callback: Amity.Listener<Amity.SubChannel>) => {
            const updateMessagePreview = async (subChannel: Amity.SubChannel) => {
              const messagePreviewSetting =
                await ChannelLiveCollectionController.getMessagePreviewSetting();
              if (messagePreviewSetting === Amity.MessagePreviewSetting.NO_MESSAGE_PREVIEW) return;

              const collections = pullFromCache<Amity.ChannelLiveCollectionCache>(
                this.cacheKey,
              )?.data;
              if (!collections) return;

              await handleSubChannelUpdated(subChannel);
              if (this.shouldAbort(subChannel.channelId)) return;

              callback(subChannel);
            };

            return onSubChannelUpdated(updateMessagePreview);
          },
          'channelId',
          'channel',
        ),
        action: Amity.ChannelActionType.OnUpdate,
      },
      {
        fn: convertEventPayload(onSubChannelCreated, 'channelId', 'channel'),
        action: Amity.ChannelActionType.OnUpdate,
      },
      {
        fn: onChannelResolved,
        action: Amity.ChannelActionType.OnResolveChannel,
      },
      {
        fn: (callback: Amity.Listener<Amity.StaticInternalChannel[]>) => {
          const handleUserFeedMarkerResolved = async (
            marker: Amity.Events['local.userMessageFeedMarkers.resolved'],
          ) => {
            if (marker.feedMarkers) {
              const channels = marker.feedMarkers
                .map(
                  feedMarker =>
                    pullFromCache<Amity.StaticInternalChannel>([
                      'channel',
                      'get',
                      feedMarker.entityId,
                    ])?.data,
                )
                .filter(Boolean) as Amity.StaticInternalChannel[];

              callback(channels);
            }
          };
          return onUserMessageFeedMarkerResolved(handleUserFeedMarkerResolved);
        },
        action: Amity.ChannelActionType.OnResolveUnread,
      },
      {
        fn: convertEventPayload(onChannelUnreadInfoUpdatedLocal, 'channelId', 'channel'),
        action: Amity.ChannelActionType.OnUpdate,
      },
      {
        fn: convertEventPayload(onChannelUnreadUpdatedLocal, 'channelId', 'channel'),
        action: Amity.ChannelActionType.OnUpdate,
      },
    ];

    if (this.paginationController instanceof PaginationController) {
      return [
        ...subscriptions,
        {
          fn: (callback: Amity.Listener<Amity.StaticInternalChannel>) => {
            return onChannelCreated(channel => {
              resolveUnreadInfoOnChannelEvent(channel);
              callback(channel);
            });
          },
          action: Amity.ChannelActionType.OnCreate,
        },
      ];
    }

    return subscriptions;
  }
}
