import { pushToCache, queryCache } from '~/cache/api';
import { pullFromCache } from '~/cache/api/pullFromCache';

export const reCalculateChannelUnreadInfo = (channelId: string): Amity.ChannelUnreadInfo => {
  const cacheKeyChannelUnread = ['channelUnreadInfo', 'get', channelId];
  const cacheChannelUnreadInfo =
    pullFromCache<Amity.ChannelUnreadInfo>(cacheKeyChannelUnread)?.data;

  const cacheKeySubChannelUnread = ['subChannelUnreadInfo', 'get'];
  const cachedSubChannelUnreadInfo =
    queryCache<Amity.SubChannelUnreadInfo>(cacheKeySubChannelUnread);

  let channelUnreads = 0;
  let isMentioned = false;

  if (cachedSubChannelUnreadInfo && cachedSubChannelUnreadInfo?.length > 0) {
    const subChannelUnreadsInfo = cachedSubChannelUnreadInfo?.filter(({ data }) => {
      return data.channelId === channelId && !data.isDeleted;
    });

    channelUnreads = subChannelUnreadsInfo
      .map(({ data }) => data.unreadCount)
      .reduce((acc, cur) => acc + cur, 0);

    isMentioned = subChannelUnreadsInfo.some(({ data }) => data.isMentioned);
  }

  const channelUnreadInfo = {
    ...(cacheChannelUnreadInfo ?? {
      channelId,
      createdAt: new Date().toISOString(),
    }),
    updatedAt: new Date().toISOString(),
    unreadCount: channelUnreads,
    isMentioned,
  };

  pushToCache(cacheKeyChannelUnread, channelUnreadInfo);

  return channelUnreadInfo;
};
