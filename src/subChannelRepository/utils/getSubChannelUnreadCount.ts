import { pullFromCache } from '~/cache/api/pullFromCache';
import { getActiveClient } from '~/client/api/activeClient';
import { getActiveUser } from '~/client/api/activeUser';
import { getResolver } from '~/core/model';

export function getSubChannelUnreadCount(
  channelId: string,
  subChannelId: string,
  marker?: Amity.SubChannelMarker,
) {
  // Look for `unreadCount` in the marker param first
  if (marker) {
    return marker.unreadCount;
  }

  const client = getActiveClient();

  // If consistent mode is enabled, look in the SubChannelUnreadCountInfo cache
  if (client.isUnreadCountEnabled && client.getMarkerSyncConsistentMode()) {
    const cachedUnreadCount = pullFromCache<Amity.SubChannelUnreadInfo>([
      'subChannelUnreadInfo',
      'get',
      subChannelId,
    ])?.data;

    if (cachedUnreadCount) {
      return cachedUnreadCount.isDeleted ? 0 : cachedUnreadCount.unreadCount;
    }

    return 0;
  }

  const key = {
    entityId: channelId,
    feedId: subChannelId,
    userId: getActiveUser()._id,
  };

  // If the marker param is not set, look in the cache
  const cachedMarker = pullFromCache<Amity.SubChannelMarker>([
    'subChannelMarker',
    'get',
    getResolver('subChannelMarker')(key),
  ])?.data;

  if (cachedMarker) {
    return cachedMarker.unreadCount;
  }

  // and if not found in cache use default value `0`
  return 0;
}
