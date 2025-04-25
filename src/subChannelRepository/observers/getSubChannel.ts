import { onSubChannelMarkerFetched, onSubChannelMarkerUpdated } from '~/marker/events';
import { convertEventPayload } from '~/utils/event';
import { liveObject } from '~/utils/liveObject';
import { getSubChannel as _getSubChannel } from '../api/getSubChannel';
import { onSubChannelDeleted, onSubChannelUpdated } from '../events';
import { onSubChannelFetched } from '../events/onSubChannelFetched';
import { pullFromCache } from '~/cache/api';
import {
  onMessageCreatedLocal,
  onMessageCreatedMqtt,
  onMessageDeleted,
  onMessageUpdated,
} from '~/messageRepository';
import {
  handleMessageCreatedOnSubChannel,
  handleMessageUpdatedOnSubChannel,
  handleSubChannelUpdated,
} from '../../messagePreview/utils/updateMessagePreviewFromMessage';
import { getActiveClient } from '~/client';
import { getSubChannelMessagePreviewWithUser } from '~/messagePreview/utils';
import { isEqual } from '~/utils/isEqual';
import { updateSubChannelCache } from '../utils/updateSubChannelCache';
import { onSubChannelUnreadUpdatedLocal } from '~/marker/events/onSubChannelUnreadUpdatedLocal';

/* begin_public_function
  id: subchannel.get
*/
/**
 * ```js
 * import { getSubChannel } from '@amityco/ts-sdk';
 *
 * let subChannel;
 *
 * const unsubscribe = getSubChannel(subChannelId, response => {
 *   subChannel = response.data;
 * });
 * ```
 *
 * Observe all mutation on a given {@link Amity.SubChannel}
 *
 * @param subChannelId the ID of the message to observe
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the sub channel
 *
 * @category SubChannel Live Object
 */
export const getSubChannel = (
  subChannelId: Amity.SubChannel['subChannelId'],
  callback: Amity.LiveObjectCallback<Amity.SubChannel>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  let snapshot: Omit<Amity.LiveObjectCallback<Amity.SubChannel>, 'origin'>;

  const reactor = (
    response: Amity.LiveObject<Amity.SubChannel>,
  ): Amity.LiveObjectCallback<Amity.SubChannel> | undefined => {
    if (!response.data) return callback(response as Amity.LiveObject<Amity.SubChannel>);

    const data = {
      ...response,
      data: getSubChannelMessagePreviewWithUser(response.data),
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
    subChannelId,
    reactor,
    'subChannelId',
    _getSubChannel,
    [
      onSubChannelFetched,
      callback => {
        const updateMessagePreview = async (subChannel: Amity.SubChannel) => {
          const messagePreviewSetting = await client.getMessagePreviewSetting(false);
          if (messagePreviewSetting === Amity.MessagePreviewSetting.NO_MESSAGE_PREVIEW) return;

          handleSubChannelUpdated(subChannel);
          if (subChannel.subChannelId !== subChannelId) return;

          callback(subChannel);
        };
        return onSubChannelUpdated(updateMessagePreview);
      },
      onSubChannelDeleted,
      convertEventPayload(onSubChannelMarkerFetched, 'feedId', 'subChannel'),
      callback => {
        return onSubChannelMarkerUpdated(subChannelMarkers => {
          const isTargetSubChannel = subChannelMarkers.find(
            ({ feedId }) => feedId === subChannelId,
          );

          if (!isTargetSubChannel) return;

          const subChannel = pullFromCache<Amity.SubChannel>([
            'subChannel',
            'get',
            subChannelId,
          ])?.data;

          if (!subChannel) return;

          callback(subChannel);
        });
      },
      convertEventPayload(
        (callback: Amity.Listener<Amity.InternalMessage>) => {
          return onMessageCreatedMqtt(async (message: Amity.InternalMessage) => {
            if (message.subChannelId !== subChannelId) return;
            await handleMessageCreatedOnSubChannel(message);
            callback(message);
          });
        },
        'subChannelId',
        'subChannel',
      ),
      convertEventPayload(
        (callback: Amity.Listener<Amity.InternalMessage>) => {
          return onMessageCreatedLocal(async (message: Amity.InternalMessage) => {
            if (message.subChannelId !== subChannelId) return;
            await handleMessageCreatedOnSubChannel(message);
            callback(message);
          });
        },
        'subChannelId',
        'subChannel',
      ),
      convertEventPayload(
        (callback: Amity.Listener<Amity.InternalMessage>) => {
          const updateMessagePreview = async (message: Amity.InternalMessage) => {
            const messagePreviewSetting = await client.getMessagePreviewSetting(false);
            if (messagePreviewSetting === Amity.MessagePreviewSetting.NO_MESSAGE_PREVIEW) return;
            if (message.subChannelId !== subChannelId) return;

            handleMessageUpdatedOnSubChannel(message);
            callback(message);

            // TODO: messageFeeds on onMessageUpdated event does not have messagePreviewId and it will save before that cause messagePreview
          };
          return onMessageUpdated(updateMessagePreview);
        },
        'subChannelId',
        'subChannel',
      ),
      convertEventPayload(
        (callback: Amity.Listener<Amity.InternalMessage>) => {
          const updateMessagePreview = async (message: Amity.InternalMessage) => {
            const messagePreviewSetting = await client.getMessagePreviewSetting(false);
            if (messagePreviewSetting === Amity.MessagePreviewSetting.NO_MESSAGE_PREVIEW) return;

            if (message.subChannelId !== subChannelId) return;
            if (
              messagePreviewSetting === Amity.MessagePreviewSetting.MESSAGE_PREVIEW_INCLUDE_DELETED
            )
              await handleMessageUpdatedOnSubChannel(message);

            if (
              messagePreviewSetting ===
              Amity.MessagePreviewSetting.MESSAGE_PREVIEW_NOT_INCLUDE_DELETED
            ) {
              await _getSubChannel(message.subChannelId);
            }

            callback(message);
          };
          return onMessageDeleted(updateMessagePreview);
        },
        'subChannelId',
        'subChannel',
      ),
      convertEventPayload(onSubChannelUnreadUpdatedLocal, 'subChannelId', 'subChannel'),
    ],
    {
      forceDispatch: true,
    },
  );
};
/* end_public_function */
