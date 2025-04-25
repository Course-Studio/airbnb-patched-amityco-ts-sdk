import { pullFromCache } from '~/cache/api/pullFromCache';

export const getLegacyChannelUnread = (channelId: string) => {
  return pullFromCache<Amity.ChannelUnreadInfo>(['channelUnread', 'get', channelId])?.data;
};
