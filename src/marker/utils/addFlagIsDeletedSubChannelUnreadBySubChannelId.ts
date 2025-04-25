import { pullFromCache, pushToCache } from '~/cache/api';

export const addFlagIsDeletedSubChannelUnreadBySubChannelId = (subChannelId: string) => {
  const cacheKey = ['subChannelUnreadInfo', 'get', subChannelId];
  const cachedSubChannelUnread = pullFromCache<Amity.SubChannelUnreadInfo>(cacheKey)?.data;

  if (cachedSubChannelUnread) {
    pushToCache(cacheKey, {
      ...cachedSubChannelUnread,
      isDeleted: true,
    });
  }
};
