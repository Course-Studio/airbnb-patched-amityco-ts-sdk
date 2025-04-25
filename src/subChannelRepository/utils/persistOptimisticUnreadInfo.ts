import { pushToCache } from '~/cache/api';

export const persistOptimisticUnreadInfo = (
  subChannelOptimisticInfo: Pick<
    Amity.SubChannel,
    'channelId' | 'subChannelId' | 'createdAt' | 'updatedAt'
  >,
) => {
  const { channelId, subChannelId, createdAt, updatedAt } = subChannelOptimisticInfo;

  const subChannelUnreadInfo: Amity.SubChannelUnreadInfo = {
    channelId,
    subChannelId,
    unreadCount: 0,
    readToSegment: 0,
    lastMentionSegment: 0,
    lastSegment: 0,
    isMentioned: false,
    isDeleted: false,
    createdAt,
    updatedAt,
  };

  pushToCache(
    ['subChannelUnreadInfo', 'get', subChannelUnreadInfo.subChannelId],
    subChannelUnreadInfo,
  );
};
