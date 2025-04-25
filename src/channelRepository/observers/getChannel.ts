import { convertEventPayload } from '~/utils/event';
import { onChannelMarkerFetched } from '~/marker/events';
import { liveObject } from '~/utils/liveObject';
import { getChannel as _getChannel } from '../internalApi/getChannel';
import {
  onChannelDeleted,
  onChannelJoined,
  onChannelLeft,
  onChannelMemberAdded,
  onChannelMemberBanned,
  onChannelMemberRemoved,
  onChannelMemberUnbanned,
  onChannelMuted,
  onChannelUpdated,
} from '../events';
import { dropFromCache, pullFromCache } from '~/cache/api';
import {
  onMessageCreatedLocal,
  onMessageCreatedMqtt,
} from '~/messageRepository/events/onMessageCreated';
import { onMessageUpdated } from '~/messageRepository/events/onMessageUpdated';
import { onMessageDeleted } from '~/messageRepository/events/onMessageDeleted';
import { onSubChannelDeleted } from '~/subChannelRepository/events/onSubChannelDeleted';
import { onSubChannelUpdated } from '~/subChannelRepository/events/onSubChannelUpdated';
import {
  handleMessageCreated,
  handleMessageUpdated,
  handleSubChannelUpdated,
} from '~/messagePreview/utils/updateMessagePreviewFromMessage';
import { getActiveClient } from '~/client/api/activeClient';
import { isEqual } from '~/utils/isEqual';
import { updateChannelCache } from '../utils/updateChannelCache';
import { onChannelMarkerUpdated } from '~/marker/events/onChannelMarkerUpdated';
import { onSubChannelCreated } from '~/subChannelRepository';
import { onChannelUnreadInfoUpdatedLocal } from '~/marker/events/onChannelUnreadInfoUpdatedLocal';
import { constructChannelObject } from '../utils/constructChannelObject';
import { onChannelUnreadUpdatedLocal } from '../events/onChannelUnreadUpdatedLocal';

/* begin_public_function
  id: channel.get
*/
/**
 * ```js
 * import { getChannel } from '@amityco/ts-sdk';
 *
 * let channel;
 *
 * const unsubscribe = getChannel(channelId, response => {
 *   channel = response.data;
 * });
 * ```
 *
 * Observe all mutation on a given {@link Amity.Channel}
 *
 * @param channelId the ID of the channel to observe
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the channel
 *
 * @category Message Live Object
 */
export const getChannel = (
  channelId: Amity.Channel['channelId'],
  callback: Amity.LiveObjectCallback<Amity.Channel>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  let snapshot: Omit<Amity.LiveObjectCallback<Amity.Channel>, 'origin'>;

  const reactor = async (
    response: Amity.LiveObject<Amity.StaticInternalChannel<any>>,
  ): Promise<Amity.LiveObjectCallback<Amity.Channel> | undefined> => {
    if (!response.data) return callback(response as unknown as Amity.LiveObject<Amity.Channel>);

    const data = {
      ...response,

      data: constructChannelObject(response.data),
    };

    const { origin, ...newSnapshot } = data;

    /**
     * check equality of previous data and current data to avoid redundancy
     * if equal, do not call the callback function
     * If not equal, assign new snapshot and return callback function
     */
    if (isEqual(snapshot, newSnapshot)) return;

    snapshot = newSnapshot;
    return callback(data);
  };

  return liveObject(
    channelId,
    reactor,
    'channelId',
    _getChannel,
    [
      onChannelUpdated,
      onChannelDeleted,
      onChannelJoined,
      onChannelLeft,
      onChannelMemberAdded,
      onChannelMemberRemoved,
      onChannelMemberBanned,
      onChannelMemberUnbanned,
      onChannelMuted,
      convertEventPayload(onChannelMarkerFetched, 'entityId', 'channel'),
      convertEventPayload(onChannelMarkerUpdated, 'entityId', 'channel'),
      convertEventPayload(
        (callback: Amity.Listener<Amity.InternalMessage>) => {
          const updateMessagePreview = async (message: Amity.InternalMessage) => {
            const messagePreviewSetting = await client.getMessagePreviewSetting(false);
            if (messagePreviewSetting === Amity.MessagePreviewSetting.NO_MESSAGE_PREVIEW) return;

            await handleMessageCreated(message);

            if (message.channelId !== channelId) return;

            // channelId from message is channelInternalId
            const channel = pullFromCache<Amity.StaticInternalChannel>([
              'channel',
              'get',
              channelId,
            ])?.data;
            if (!channel) return;

            updateChannelCache(channel, {
              messagePreviewId: message.messageId,
            });

            callback(message);
          };

          return onMessageCreatedMqtt(async (message: Amity.InternalMessage) => {
            await updateMessagePreview(message);
            callback(message);
          });
        },
        'channelId',
        'channel',
      ),
      convertEventPayload(
        (callback: Amity.Listener<Amity.InternalMessage>) => {
          const updateMessagePreview = async (message: Amity.InternalMessage) => {
            const messagePreviewSetting = await client.getMessagePreviewSetting(false);
            if (messagePreviewSetting === Amity.MessagePreviewSetting.NO_MESSAGE_PREVIEW) return;

            await handleMessageCreated(message);

            if (message.channelId !== channelId) return;

            // channelId from message is channelInternalId
            const channel = pullFromCache<Amity.StaticInternalChannel>([
              'channel',
              'get',
              channelId,
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
      convertEventPayload(
        (callback: Amity.Listener<Amity.InternalMessage>) => {
          const updateMessagePreview = async (message: Amity.InternalMessage) => {
            const channel = pullFromCache<Amity.StaticInternalChannel>([
              'channel',
              'get',
              channelId,
            ])?.data;
            if (!channel || channel.messagePreviewId !== message.messageId) return;

            const messagePreviewSetting = await client.getMessagePreviewSetting(false);

            if (messagePreviewSetting === Amity.MessagePreviewSetting.NO_MESSAGE_PREVIEW) return;

            await handleMessageUpdated(message);

            callback(message);
          };

          return onMessageUpdated(updateMessagePreview);
        },
        'channelId',
        'channel',
      ),
      convertEventPayload(
        (callback: Amity.Listener<Amity.InternalMessage>) => {
          const updateMessagePreview = async (message: Amity.InternalMessage) => {
            const channel = pullFromCache<Amity.StaticInternalChannel>([
              'channel',
              'get',
              channelId,
            ])?.data;
            if (!channel || channel.messagePreviewId !== message.messageId) return;

            const messagePreviewSetting = await client.getMessagePreviewSetting(false);

            if (messagePreviewSetting === Amity.MessagePreviewSetting.NO_MESSAGE_PREVIEW) return;

            if (
              messagePreviewSetting ===
              Amity.MessagePreviewSetting.MESSAGE_PREVIEW_NOT_INCLUDE_DELETED
            ) {
              dropFromCache(['messagePreviewChannel', 'get', channelId]);
              await _getChannel(message.channelId);
            } else {
              await handleMessageUpdated(message);
            }

            callback(message);
          };

          return onMessageDeleted(updateMessagePreview);
        },
        'channelId',
        'channel',
      ),
      convertEventPayload(
        (callback: Amity.Listener<Amity.SubChannel>) => {
          const updateMessagePreview = async (subChannel: Amity.SubChannel) => {
            const { channelId, subChannelId } = subChannel;

            const messagePreviewCache = pullFromCache<Amity.InternalMessagePreview>([
              'messagePreviewChannel',
              'get',
              channelId,
            ])?.data;

            if (!messagePreviewCache || messagePreviewCache.subChannelId !== subChannelId) return;

            const messagePreviewSetting = await client.getMessagePreviewSetting(false);
            if (messagePreviewSetting === Amity.MessagePreviewSetting.NO_MESSAGE_PREVIEW) return;

            await _getChannel(channelId);

            const channel = pullFromCache<Amity.StaticInternalChannel>([
              'channel',
              'get',
              channelId,
            ])?.data;
            if (!channel) return;

            callback(subChannel);
          };

          return onSubChannelDeleted(updateMessagePreview);
        },
        'channelId',
        'channel',
      ),
      convertEventPayload(
        (callback: Amity.Listener<Amity.SubChannel>) => {
          const updateMessagePreview = async (subChannel: Amity.SubChannel) => {
            const messagePreviewSetting = await client.getMessagePreviewSetting(false);

            if (messagePreviewSetting === Amity.MessagePreviewSetting.NO_MESSAGE_PREVIEW) return;

            handleSubChannelUpdated(subChannel);

            const messagePreviewCache = pullFromCache<Amity.InternalMessagePreview>([
              'messagePreviewChannel',
              'get',
              channelId,
            ])?.data;

            if (
              !messagePreviewCache ||
              messagePreviewCache.subChannelId !== subChannel.subChannelId
            )
              return;

            const channel = pullFromCache<Amity.StaticInternalChannel>([
              'channel',
              'get',
              channelId,
            ])?.data;
            if (!channel) return;

            callback(subChannel);
          };

          return onSubChannelUpdated(updateMessagePreview);
        },
        'channelId',
        'channel',
      ),
      convertEventPayload(onSubChannelCreated, 'channelId', 'channel'),
      convertEventPayload(onChannelUnreadInfoUpdatedLocal, 'channelId', 'channel'),
      convertEventPayload(onChannelUnreadUpdatedLocal, 'channelId', 'channel'),
    ],
    {
      forceDispatch: true,
    },
  );
};
/* end_public_function */
