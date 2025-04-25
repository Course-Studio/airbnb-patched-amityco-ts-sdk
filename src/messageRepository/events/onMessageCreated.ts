import { getActiveClient } from '~/client/api/activeClient';
import { createEventSubscriber, fireEvent } from '~/core/events';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { updateSubChannelUnreadFromMessage } from '~/marker/utils/updateSubChannelUnreadFromMessage';
import { reCalculateChannelUnreadInfo } from '~/marker/utils/reCalculateChannelUnreadInfo';
import { getActiveUser } from '~/client/api/activeUser';
import { markReadMessage } from '../utils/markReadMessage';
import { prepareMessagePayload } from '../utils';
import { pullFromCache, pushToCache } from '~/cache/api';

/**
 * ```js
 * import { onMessageCreated } from '@amityco/ts-sdk'
 * const dispose = onMessageCreated(message => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.Message} has been created
 *
 * @param callback The function to call when the event was fired
 * @param local Trigger when an event occurs from a local event or not
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Message Events
 */
export const onMessageCreatedMqtt = (
  callback: Amity.Listener<Amity.InternalMessage>,
): Amity.Unsubscriber => {
  const client = getActiveClient();
  const user = getActiveUser();

  const filter = async (rawPayload: Amity.MessagePayload) => {
    const payload = await prepareMessagePayload(rawPayload);

    // update unreadCountInfo in cache
    if (client.isUnreadCountEnabled && client.getMarkerSyncConsistentMode()) {
      rawPayload.messages.forEach(message => {
        updateSubChannelUnreadFromMessage(message);
        reCalculateChannelUnreadInfo(message.channelId);
      });
    }

    if (client.useLegacyUnreadCount) {
      rawPayload.messages.forEach(message => {
        const channelUnread = pullFromCache<Amity.ChannelUnread>([
          'channelUnread',
          'get',
          message.channelId,
        ])?.data;

        if (
          !channelUnread ||
          channelUnread.lastSegment >= message.segment ||
          typeof channelUnread.readToSegment !== 'number' ||
          typeof channelUnread.lastMentionedSegment !== 'number'
        )
          return;

        const lastSegment = message.segment;
        const isMentionedInMessage = message.mentionedUsers?.some(mention => {
          return (
            mention.type === 'channel' ||
            (mention.type === 'user' &&
              client.userId &&
              mention.userPublicIds.includes(client.userId))
          );
        });

        const lastMentionedSegment = isMentionedInMessage
          ? message.segment
          : channelUnread.lastMentionedSegment;

        const updatedChannelUnread: Amity.ChannelUnread = {
          ...channelUnread,
          lastSegment,
          unreadCount: Math.max(lastSegment - channelUnread.readToSegment, 0),
          lastMentionedSegment,
          isMentioned: !(channelUnread.readToSegment >= lastMentionedSegment),
        };

        pushToCache(['channelUnread', 'get', message.channelId], updatedChannelUnread);
        fireEvent('local.channelUnread.updated', updatedChannelUnread);
      });
    }

    // Update in cache
    ingestInCache(payload);

    payload.messages.forEach(message => {
      if (message.creatorPrivateId === user._id) markReadMessage(message);
      callback(message);
    });
  };

  const disposers = [
    createEventSubscriber(client, 'message/onMessageCreated', 'message.created', filter),
  ];

  return () => {
    disposers.forEach(fn => fn());
  };
};

export const onMessageCreatedLocal = (
  callback: Amity.Listener<Amity.InternalMessage>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  const disposers = [
    createEventSubscriber(
      client,
      'message/onMessageCreated',
      'local.message.created',
      async payload => {
        ingestInCache(payload);
        return payload.messages.forEach(message => {
          callback(message);
        });
      },
    ),
  ];

  return () => {
    disposers.forEach(fn => fn());
  };
};
