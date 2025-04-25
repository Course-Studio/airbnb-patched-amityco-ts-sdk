import { queryCache } from '~/cache/api';
import { getActiveClient } from '~/client/api/activeClient';

/**
 *
 * Calculate user unread from {@link Amity.ChannelUnread} objects
 *
 * @returns the {@link Amity.UserUnread} objects
 *
 * @category Channel API
 * @async
 */

export const getTotalChannelsUnread = (): Amity.Cached<Amity.UserUnread> => {
  const client = getActiveClient();
  client.log('channel/getTotalChannelsUnread.locally');

  const cachedChannelsUnread =
    queryCache<Amity.ChannelUnread>(['channelUnread', 'get'])?.filter(({ data }) => {
      return !data.isDeleted;
    }) || [];

  const totalChannelsUnread: Amity.UserUnread = cachedChannelsUnread?.reduce(
    (acc, { data }) => {
      acc.unreadCount += data.unreadCount;
      acc.isMentioned = acc.isMentioned || data.isMentioned;
      return acc;
    },
    { unreadCount: 0, isMentioned: false as boolean },
  ) || { unreadCount: 0, isMentioned: false };

  const cachedAt = client.cache && Date.now();

  return {
    data: totalChannelsUnread,
    cachedAt,
  };
};
