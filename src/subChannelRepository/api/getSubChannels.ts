import { pullFromCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { getActiveClient } from '~/client/api/activeClient';
import { fireEvent } from '~/core/events';
import { prepareSubChannelPayload } from '../utils';

/**
 * ```js
 * import { getSubChannels } from '@amityco/ts-sdk'
 * const subChannels = await getSubChannels(['foo', 'bar'])
 * ```
 *
 * Fetches a collection of {@link Amity.SubChannel} objects
 *
 * @param subChannelIds the IDs of the {@link Amity.SubChannel} to fetch
 * @returns the associated collection of {@link Amity.SubChannel} objects
 *
 * @category Channel API
 * @async
 */
export const getSubChannels = async (
  subChannelIds: Amity.SubChannel['subChannelId'][],
): Promise<Amity.Cached<Amity.SubChannel[]>> => {
  const client = getActiveClient();
  client.log('channel/getSubChannels', subChannelIds);

  const response = await client.http.get<Amity.SubChannelPayload>('/api/v5/message-feeds/list', {
    params: { messageFeedIds: subChannelIds.map(encodeURIComponent) },
  });

  const data = await prepareSubChannelPayload(response.data);

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(data, { cachedAt });

  fireEvent('local.message-feed.fetched', data);

  return {
    data: data.messageFeeds,
    cachedAt,
  };
};

/**
 * ```js
 * import { getSubChannels } from '@amityco/ts-sdk'
 * const subChannels = getSubChannels.locally(['foo', 'bar']) ?? []
 * ```
 *
 * Fetches a collection of {@link Amity.SubChannel} objects from cache
 *
 * @param subChannelIds the IDs of the {@link Amity.SubChannel} to fetch
 * @returns the associated collection of {@link Amity.SubChannel} objects
 *
 * @category Channel API
 */
getSubChannels.locally = (
  subChannelIds: Amity.SubChannel['subChannelId'][],
): Amity.Cached<Amity.SubChannel[]> | undefined => {
  const client = getActiveClient();
  client.log('channel/getSubChannels.locally', subChannelIds);

  if (!client.cache) return;

  const cached = subChannelIds
    .map(channelId => pullFromCache<Amity.SubChannel>(['subChannel', 'get', channelId])!)
    .filter(Boolean);

  if (cached?.length < subChannelIds.length) return;

  const subChannels = cached.map(({ data }) => data);
  const oldest = cached.sort((a, b) => (a.cachedAt! < b.cachedAt! ? -1 : 1))?.[0];

  return {
    data: subChannels,
    cachedAt: oldest.cachedAt,
  };
};
