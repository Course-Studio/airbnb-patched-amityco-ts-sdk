import { ingestInCache } from '~/cache/api/ingestInCache';
import { reCalculateChannelUnreadInfo } from './reCalculateChannelUnreadInfo';

export const persistUnreadCountInfo = (payload: Amity.UserFeedUpdatedPayload) => {
  const { feedMarkers, userFeedMarkers } = payload;

  // calculate sub channel unread info and channel unread info
  if (feedMarkers.length > 0 && userFeedMarkers.length > 0) {
    const channelIds: string[] = [];

    const feedMarkerMap = new Map(feedMarkers.map(fm => [fm.feedId, fm]));

    userFeedMarkers.forEach(userFeedMarker => {
      const feedMarker = feedMarkerMap.get(userFeedMarker.feedId);
      if (!feedMarker) return;

      if (feedMarker.feedId === userFeedMarker.feedId) {
        const unreadCount = feedMarker.lastSegment - userFeedMarker.readToSegment;

        const subChannelUnreadInfo: Amity.SubChannelUnreadInfo = {
          subChannelId: feedMarker.feedId,
          channelId: feedMarker.entityId,
          readToSegment: userFeedMarker.readToSegment,
          lastSegment: feedMarker.lastSegment,
          lastMentionSegment: userFeedMarker.lastMentionSegment,
          unreadCount: Math.max(0, unreadCount),
          isMentioned: userFeedMarker.isMentioned,
          isDeleted: feedMarker.isDeleted,
          createdAt: userFeedMarker.createdAt,
          updatedAt: userFeedMarker.updatedAt,
        };

        // update sub channel unread info in cache
        ingestInCache({ subChannelUnreadInfo: [subChannelUnreadInfo] });

        if (!channelIds.includes(feedMarker.entityId)) {
          channelIds.push(feedMarker.entityId);
        }
      }
    });

    // re-calculate channel unread info in cache
    channelIds.forEach(channelId => {
      reCalculateChannelUnreadInfo(channelId);
    });
  }
};
