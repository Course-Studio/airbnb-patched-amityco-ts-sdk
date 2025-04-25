import { getActiveClient } from '~/client/api';

import { pullFromCache, queryCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';

import { isInTombstone } from '~/cache/api/isInTombstone';
import { checkIfShouldGoesToTombstone } from '~/cache/utils';
import { pushToTombstone } from '~/cache/api/pushToTombstone';

import { prepareChannelPayload } from '../utils';
import { prepareUnreadCountInfo } from '../utils/prepareUnreadCountInfo';
import { constructChannelDynamicValue } from '../utils/constructChannelDynamicValue';

/**
 * ```js
 * import { getChannel } from '@amityco/ts-sdk'
 * const channel = await getChannel('foobar')
 * ```
 *
 * Fetches a {@link Amity.Channel} object
 *
 * @param channelId the ID of the {@link Amity.Channel} to fetch
 * @returns the associated {@link Amity.Channel} object
 *
 * @category Channel API
 * @async
 */
export const getChannel = async (
  channelId: Amity.Channel['channelPublicId'],
): Promise<Amity.Cached<Amity.StaticInternalChannel>> => {
  const client = getActiveClient();
  client.log('channel/getChannel', channelId);

  isInTombstone('channel', channelId);

  let data: Amity.ProcessedChannelPayload;

  try {
    const { data: payload } = await client.http.get<Amity.ChannelPayload>(
      `/api/v3/channels/${encodeURIComponent(channelId)}`,
    );

    data = await prepareChannelPayload(payload);

    if (client.isUnreadCountEnabled && client.getMarkerSyncConsistentMode()) {
      prepareUnreadCountInfo(payload);
    }
  } catch (error) {
    if (checkIfShouldGoesToTombstone((error as Amity.ErrorResponse)?.code)) {
      // NOTE: use channelPublicId as tombstone cache key since we cannot get the channelPrivateId that come along with channel data from server
      pushToTombstone('channel', channelId);
    }

    throw error;
  }

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(data, { cachedAt });

  const { channels } = data;

  return {
    data: channels.find(channel => channel.channelId === channelId)!,
    cachedAt,
  };
};

/**
 * ```js
 * import { getChannel } from '@amityco/ts-sdk'
 * const channel = getChannel.locally('foobar')
 * ```
 *
 * Fetches a {@link Amity.Channel} object from cache
 *
 * @param channelId the ID of the {@link Amity.Channel} to fetch
 * @returns the associated {@link Amity.Channel} object
 *
 * @category Channel API
 */
getChannel.locally = (
  channelId: Amity.Channel['channelPublicId'],
): Amity.Cached<Amity.StaticInternalChannel> | undefined => {
  const client = getActiveClient();
  client.log('channel/getChannel.locally', channelId);

  if (!client.cache) return;

  // use queryCache to get all channel caches and filter by channelPublicId since we use channelPrivateId as cache key
  const cached = queryCache<Amity.StaticInternalChannel>(['channel', 'get'])?.filter(({ data }) => {
    return data.channelPublicId === channelId;
  });

  if (!cached || cached?.length === 0) return;

  return {
    data: cached[0].data,
    cachedAt: cached[0].cachedAt,
  };
};
