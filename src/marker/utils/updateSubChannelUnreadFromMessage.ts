import { pullFromCache, pushToCache } from '~/cache/api';
import { getActiveClient } from '~/client/api/activeClient';

export const updateSubChannelUnreadFromMessage = (message: Amity.RawMessage) => {
  const client = getActiveClient();
  const cacheKeyUnreadCount = ['subChannelUnreadInfo', 'get', message.messageFeedId];
  const cachedUnreadCount = pullFromCache<Amity.SubChannelUnreadInfo>(cacheKeyUnreadCount)?.data;

  if (!cachedUnreadCount) return;

  const lastSegment =
    cachedUnreadCount.lastSegment < message.segment
      ? message.segment
      : cachedUnreadCount.lastSegment;

  const unreadCount = lastSegment - cachedUnreadCount.readToSegment;

  let { lastMentionSegment } = cachedUnreadCount;

  if (message.mentionedUsers && message.mentionedUsers.length > 0) {
    message.mentionedUsers.forEach(mention => {
      if (
        mention.type === 'channel' ||
        (mention.type === 'user' && client.userId && mention.userPublicIds.includes(client.userId))
      ) {
        lastMentionSegment = message.segment;
      }
    });
  }

  const updatedCachedUnreadCount = {
    ...cachedUnreadCount,
    lastMentionSegment,
    lastSegment,
    isMentioned: !(cachedUnreadCount.readToSegment >= lastMentionSegment),
    unreadCount: Math.max(unreadCount, 0),
  };

  pushToCache(cacheKeyUnreadCount, updatedCachedUnreadCount);
};
