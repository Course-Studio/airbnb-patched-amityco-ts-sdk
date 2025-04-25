import { createEventSubscriber } from '~/core/events';

import { getActiveClient } from '~/client/api/activeClient';
import { ingestInCache } from '~/cache/api/ingestInCache';

import { prepareChannelPayload } from '../utils';
import { addFlagIsDeletedSubChannelUnreadByChannelId } from '~/marker/utils/addFlagIsDeletedSubChannelUnreadByChannelId';
import { deleteChannelUnreadByChannelId } from '../../marker/utils/deleteChannelUnreadByChannelId';

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

export const onChannelMemberBanned = (
  callback: (channel: Amity.StaticInternalChannel, member: Amity.Membership<'channel'>) => void,
) => {
  const client = getActiveClient();

  const filter = async (payload: Amity.ChannelMembershipPayload) => {
    const preparedPayload = await prepareChannelPayload(payload);
    const { channels, channelUsers } = preparedPayload;

    const isCurrentUserBanned = channelUsers.some(
      cu => cu.membership === 'banned' && cu.userId === client.userId,
    );

    if (
      client.isUnreadCountEnabled &&
      client.getMarkerSyncConsistentMode() &&
      isCurrentUserBanned
    ) {
      preparedPayload.channels.forEach(channel => {
        addFlagIsDeletedSubChannelUnreadByChannelId(channel.channelId);
        deleteChannelUnreadByChannelId(channel.channelId);
      });
    }

    ingestInCache(preparedPayload);
    callbacks.forEach(cb => cb(channels[0], channelUsers.find(cu => cu.membership === 'banned')!));
  };

  mainDisposer = createEventSubscriber(client, 'onChannelMemberBanned', 'channel.banned', filter);

  callbacks.push(callback);
  return () => dispose(callback);
};
