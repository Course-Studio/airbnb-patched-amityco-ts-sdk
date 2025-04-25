import { get } from 'http';
import { shallowClone } from '~/utils/shallowClone';
import { getChannelIsMentioned } from './getChannelIsMentioned';
import { getSubChannelsUnreadCount } from './getSubChannelsUnreadCount';
import { getActiveClient } from '~/client/api/activeClient';
import { getLegacyChannelUnread } from './getLegacyChannelUnread';

export const constructChannelDynamicValue = (
  channel: Amity.StaticInternalChannel,
): Amity.InternalChannel => {
  const client = getActiveClient();
  const { messageCount, ...rest } = channel;

  return shallowClone(rest, {
    get unreadCount() {
      return getLegacyChannelUnread(rest.channelId)?.unreadCount ?? 0;
    },
    get subChannelsUnreadCount() {
      return getSubChannelsUnreadCount(rest);
    },
    get isMentioned() {
      if (client.useLegacyUnreadCount)
        return getLegacyChannelUnread(rest.channelId)?.isMentioned ?? false;
      return getChannelIsMentioned(rest);
    },
  });
};
