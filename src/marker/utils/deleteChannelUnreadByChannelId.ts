import { pullFromCache, dropFromCache } from '~/cache/api';

export const deleteChannelUnreadByChannelId = (channelId: string) => {
  const channelUnreadInfoCacheKey = ['channelUnreadInfo', 'get', channelId];
  const channelUnreadInfoCache =
    pullFromCache<Amity.ChannelUnreadInfo>(channelUnreadInfoCacheKey)?.data;

  if (channelUnreadInfoCache) {
    dropFromCache(channelUnreadInfoCacheKey);
  }
};
