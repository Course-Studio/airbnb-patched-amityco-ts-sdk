import { getActiveClient } from '~/client/api/activeClient';
import { createEventSubscriber } from '~/core/events';

import { ingestInCache } from '~/cache/api/ingestInCache';

import { prepareChannelPayload } from '../utils';
import { deleteChannelUnreadByChannelId } from '../../marker/utils/deleteChannelUnreadByChannelId';
import { addFlagIsDeletedSubChannelUnreadByChannelId } from '~/marker/utils/addFlagIsDeletedSubChannelUnreadByChannelId';
import { dropFromCache } from '~/cache/api';

type CallbackFn = (
  channel: Amity.StaticInternalChannel,
  member: Amity.Membership<'channel'>,
) => void;
const callbacks: CallbackFn[] = [];
let mainDisposer: (() => void) | null = null;

const dispose = (cb: CallbackFn) => {
  const index = callbacks.indexOf(cb);
  if (index > -1) {
    callbacks.splice(index, 1);
  }
  if (callbacks.length === 0) {
    mainDisposer?.();
  }
};

export const onChannelLeft = (
  callback: (channel: Amity.StaticInternalChannel, member: Amity.Membership<'channel'>) => void,
) => {
  if (callbacks.length === 0) {
    const client = getActiveClient();

    const filter = async (payload: Amity.ChannelMembershipPayload) => {
      const { userId } = getActiveClient();
      const { channelUsers: leftUsers } = payload;

      const isLeftByMe = leftUsers.some(user => user.userId === userId);

      const preparedPayload = await prepareChannelPayload(payload, {
        isMessagePreviewUpdated: isLeftByMe,
      });

      const isConsistentMode = client.getMarkerSyncConsistentMode() && client.isUnreadCountEnabled;
      const isLegacyUnreadCount = client.useLegacyUnreadCount;

      if (isLeftByMe) {
        preparedPayload.channels.forEach(channel => {
          if (isConsistentMode) {
            addFlagIsDeletedSubChannelUnreadByChannelId(channel.channelId);
            deleteChannelUnreadByChannelId(channel.channelId);
          } else if (isLegacyUnreadCount) {
            dropFromCache(['channelUnread', 'get', channel.channelId]);
          }
        });
      }

      const { channels, channelUsers } = preparedPayload;

      ingestInCache(preparedPayload);
      callbacks.forEach(cb => cb(channels[0], channelUsers[0]));
    };

    mainDisposer = createEventSubscriber(client, 'onChannelLeft', 'channel.left', filter);
  }

  callbacks.push(callback);

  return () => dispose(callback);
};
