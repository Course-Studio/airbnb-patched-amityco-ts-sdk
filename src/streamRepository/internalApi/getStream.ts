import { getActiveClient } from '~/client/api';

import { pullFromCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';

/* begin_public_function
  id: stream.get
*/
/**
 * ```js
 * import { getStream } from '@amityco/ts-sdk'
 * const stream = await getStream('foobar')
 * ```
 *
 * Fetches a {@link Amity.Stream} object
 *
 * @param streamId the ID of the {@link Amity.Stream} to fetch
 * @returns the associated {@link Amity.Stream} object
 *
 * @category Stream API
 * @async
 */
export const getStream = async (
  streamId: Amity.Stream['streamId'],
): Promise<Amity.Cached<Amity.Stream>> => {
  const client = getActiveClient();
  client.log('stream/getStream', streamId);

  const { data } = await client.http.get<Amity.StreamPayload>(
    `/api/v3/video-streaming/${streamId}`,
  );

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(data, { cachedAt });

  const { videoStreamings } = data;

  return {
    data: videoStreamings.find(stream => stream.streamId === streamId)!,
    cachedAt,
  };
};
/* end_public_function */

/**
 * ```js
 * import { getStream } from '@amityco/ts-sdk'
 * const stream = getStream.locally('foobar')
 * ```
 *
 * Fetches a {@link Amity.Stream} object
 *
 * @param streamId the ID of the {@link Amity.Stream} to fetch
 * @returns the associated {@link Amity.Stream} object
 *
 * @category Stream API
 */
getStream.locally = (
  streamId: Amity.Stream['streamId'],
): Amity.Cached<Amity.Stream> | undefined => {
  const client = getActiveClient();
  client.log('stream/getStream', streamId);

  if (!client.cache) return;

  const cached = pullFromCache<Amity.Stream>(['stream', 'get', streamId]);

  if (!cached) return;

  return {
    data: cached.data,
    cachedAt: cached.cachedAt,
  };
};
