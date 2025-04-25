import { getActiveClient } from '~/client/api/activeClient';

import { queryCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';

import { checkIfShouldGoesToTombstone } from '~/cache/utils';
import { pushToTombstone } from '~/cache/api/pushToTombstone';
import { prepareChannelPayload } from '../utils';
import { fireEvent } from '~/core/events';
import { prepareUnreadCountInfo } from '../utils/prepareUnreadCountInfo';

import { constructChannelObject } from '../utils/constructChannelObject';

/**
 * ```js
 * import { getChannelByIds } from '@amityco/ts-sdk'
 * const channels = await getChannelByIds(['foo', 'bar'])
 * ```
 *
 * Fetches a collection of {@link Amity.Channel} objects
 *
 * @param channelIds the IDs of the {@link Amity.Channel} to fetch
 * @returns the associated collection of {@link Amity.Channel} objects
 *
 * @category Channel API
 * @async
 */
export const getChannelByIds = async (
  channelIds: Amity.Channel['channelPublicId'][],
): Promise<Amity.Cached<Amity.Channel[]>> => {
  const client = getActiveClient();
  client.log('channel/getChannelByIds', channelIds);

  const encodedChannelIds = channelIds.map(channelId => encodeURIComponent(channelId));

  let payload: Amity.ChannelPayload;

  try {
    // API-FIX: endpoint should not be /list, parameters should be querystring.
    const response = await client.http.get<Amity.ChannelPayload>(`/api/v3/channels/list`, {
      params: { channelIds: encodedChannelIds },
    });

    payload = response.data;
  } catch (error) {
    channelIds.forEach(channelId => {
      if (checkIfShouldGoesToTombstone((error as Amity.ErrorResponse)?.code)) {
        // NOTE: use channelPublicId as tombstone cache key since we cannot get the channelPrivateId that come along with channel data from server
        pushToTombstone('channel', channelId);
      }
    });

    throw error;
  }

  const data = await prepareChannelPayload(payload);

  if (client.isUnreadCountEnabled && client.getMarkerSyncConsistentMode()) {
    await prepareUnreadCountInfo(payload);
  }

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(data, { cachedAt });

  fireEvent('local.channel.fetched', data.channels);

  return {
    data: data.channels.map(channel => constructChannelObject(channel)),
    cachedAt,
  };
};

/**
 * ```js
 * import { getChannelByIds } from '@amityco/ts-sdk'
 * const channels = getChannelByIds.locally(['foo', 'bar']) ?? []
 * ```
 *
 * Fetches a collection of {@link Amity.Channel} objects from cache
 *
 * @param channelIds the IDs of the {@link Amity.Channel} to fetch
 * @returns the associated collection of {@link Amity.Channel} objects
 *
 * @category Channel API
 */
getChannelByIds.locally = (
  channelIds: Amity.Channel['channelPublicId'][],
): Amity.Cached<Amity.Channel[]> | undefined => {
  const client = getActiveClient();
  client.log('channel/getChannelByIds.locally', channelIds);

  if (!client.cache) return;

  const cached = queryCache<Amity.StaticInternalChannel>(['channel', 'get'])?.filter(({ data }) => {
    return channelIds.includes(data.channelPublicId);
  });

  if (!cached || cached?.length < channelIds.length) return;

  const channels = cached.map(({ data }) => data);
  const oldest = cached.sort((a, b) => (a.cachedAt! < b.cachedAt! ? -1 : 1))?.[0];

  return {
    data: channels.map(channel => constructChannelObject(channel)),
    cachedAt: oldest.cachedAt,
  };
};
