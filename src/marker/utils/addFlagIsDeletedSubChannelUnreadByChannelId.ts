import { pushToCache, queryCache } from '~/cache/api';

export const addFlagIsDeletedSubChannelUnreadByChannelId = (channelId: string) => {
  const cacheKey = ['subChannelUnreadInfo', 'get'];
  const cachedSubChannelUnread = queryCache<Amity.SubChannelUnreadInfo>(cacheKey);

  if (cachedSubChannelUnread) {
    const cachedTargetSubChannelUnread = cachedSubChannelUnread?.filter(
      ({ data }) => data.channelId === channelId,
    );

    cachedTargetSubChannelUnread.forEach(({ key, data }) => {
      pushToCache(key, {
        ...data,
        isDeleted: true,
      });
    });
  }
};
