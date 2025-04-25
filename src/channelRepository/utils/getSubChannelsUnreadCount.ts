import { pullFromCache } from '~/cache/api/pullFromCache';
import { getActiveClient } from '~/client/api/activeClient';
import { getActiveUser } from '~/client/api/activeUser';
import { getResolver } from '~/core/model';

const getCachedMarker = (entityId: string) => {
  const key = {
    entityId,
    userId: getActiveUser()._id,
  };

  return pullFromCache<Amity.ChannelMarker>([
    'channelMarker',
    'get',
    getResolver('channelMarker')(key),
  ])?.data;
};

const getUnreadInfoCached = (channelId: Amity.RawChannel['channelId']) => {
  return pullFromCache<Amity.ChannelUnreadInfo>(['channelUnreadInfo', 'get', channelId])?.data;
};

/**
 * The function use to get value of unreadCount field.
 * function will get the value from marker params first, if there is no hasMentioned field, will look in to the cache.
 *
 * If consistent mode is enabled, the function will return the value from the channelUnreadCountInfo cache.
 * If not, the function will return the value from the channelMarker cache.
 * If not found in the both cache, use `0` as defaul value.
 */

export const getSubChannelsUnreadCount = (
  channel: Omit<Amity.RawChannel, 'messageCount'>,
  marker?: Amity.ChannelMarker,
) => {
  const client = getActiveClient();

  if (client.isUnreadCountEnabled && client.getMarkerSyncConsistentMode()) {
    // Marker service API uses channelInternalId as channelId
    return getUnreadInfoCached(channel.channelInternalId)?.unreadCount ?? 0;
  }

  if (marker?.isDeleted) {
    // NOTE: This is a temporary solution to handle the channel marker when the user is forced to
    // leave the channel because currently backend can't handle this, so every time a user is banned
    // from a channel or the channel is deleted the channel's unread count will reset to zero
    return 0;
  }

  return marker?.unreadCount ?? getCachedMarker(channel.channelInternalId)?.unreadCount ?? 0;
};
