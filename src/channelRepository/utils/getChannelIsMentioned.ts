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
 * The function use to get value of hasMentioned or isMentioned field.
 * function will get the value from marker params first, if there is no hasMentioned field, will look in to the cache.
 *
 * If consistent mode is enabled, the function will return the value from the channelUnreadCountInfo cache.
 * If not, the function will return the value from the channelMarker cache.
 * If not found in the both cache, use `false` as defaul value.
 */

export const getChannelIsMentioned = (
  channel: Omit<Amity.RawChannel, 'messageCount'>,
  marker?: Amity.ChannelMarker,
) => {
  const client = getActiveClient();

  if (client.isUnreadCountEnabled && client.getMarkerSyncConsistentMode()) {
    return getUnreadInfoCached(channel.channelPublicId)?.isMentioned ?? false;
  }

  return marker?.hasMentioned !== undefined
    ? marker?.hasMentioned
    : getCachedMarker(channel.channelPublicId)?.hasMentioned ?? false;
};
