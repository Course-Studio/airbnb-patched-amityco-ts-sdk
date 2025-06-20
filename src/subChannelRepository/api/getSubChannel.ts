import { pullFromCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { isInTombstone } from '~/cache/api/isInTombstone';
import { pushToTombstone } from '~/cache/api/pushToTombstone';
import { checkIfShouldGoesToTombstone } from '~/cache/utils';
import { getActiveClient } from '~/client/api/activeClient';
import { fireEvent } from '~/core/events';

import { prepareSubChannelPayload } from '../utils/prepareSubChannelPayload';

/**
 * ```js
 * import { getSubChannel } from '@amityco/ts-sdk'
 * const subChannel = await getSubChannel('foobar')
 * ```
 *
 * Fetches a {@link Amity.SubChannel} object
 *
 * @param subChannelId the ID of the {@link Amity.SubChannel} to fetch
 * @returns the associated {@link Amity.SubChannel} object
 *
 * @category Channel API
 * @async
 */
export const getSubChannel = async (
  subChannelId: Amity.SubChannel['subChannelId'],
): Promise<Amity.Cached<Amity.SubChannel>> => {
  const client = getActiveClient();
  client.log('channel/getSubChannel', subChannelId);

  isInTombstone('subChannel', subChannelId);

  try {
    const response = await client.http.get<Amity.SubChannelPayload>(
      `/api/v5/message-feeds/${encodeURIComponent(subChannelId)}`,
    );
    const data = await prepareSubChannelPayload(response.data);

    const cachedAt = client.cache && Date.now();
    if (client.cache) ingestInCache(data, { cachedAt });

    fireEvent('local.message-feed.fetched', data);

    return {
      data: data.messageFeeds[0],
      cachedAt,
    };
  } catch (error) {
    if (checkIfShouldGoesToTombstone((error as Amity.ErrorResponse)?.code)) {
      pushToTombstone('subChannel', subChannelId);
    }

    throw error;
  }
};

/**
 * ```js
 * import { getSubChannel } from '@amityco/ts-sdk'
 * const subChannel = getSubChannel.locally('foobar')
 * ```
 *
 * Fetches a {@link Amity.SubChannel} object from cache
 *
 * @param subChannelId the ID of the {@link Amity.SubChannel} to fetch
 * @returns the associated {@link Amity.SubChannel} object
 *
 * @category Channel API
 */
getSubChannel.locally = (
  subChannelId: Amity.SubChannel['subChannelId'],
): Amity.Cached<Amity.SubChannel> | undefined => {
  const client = getActiveClient();
  client.log('channel/getSubChannel.locally', subChannelId);

  if (!client.cache) return;

  const cached = pullFromCache<Amity.SubChannel>(['subChannel', 'get', subChannelId]);

  if (!cached) return;

  return {
    data: cached.data,
    cachedAt: cached.cachedAt,
  };
};
