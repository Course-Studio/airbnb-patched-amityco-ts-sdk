import { getActiveClient } from '~/client/api';

import { ingestInCache } from '~/cache/api/ingestInCache';

/* begin_public_function
  id: stream.query
*/
/**
 * ```js
 * import { getStreams } from '@amityco/ts-sdk'
 * const streams = await getStreams()
 * ```
 *
 * Queries a paginable list of {@link Amity.InternalStream} objects
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.InternalStream} objects
 *
 * @category Stream API
 * @async
 */
export const queryStreams = async (
  query?: Amity.QueryStreams,
): Promise<Amity.Cached<Amity.PageToken<Amity.InternalStream>>> => {
  const client = getActiveClient();
  client.log('stream/queryStreams', query);

  const { page, limit, ...params } = query ?? {};

  const options = (() => {
    if (page) return { token: page };
    if (limit) return { limit };

    return undefined;
  })();

  const { data } = await client.http.get<{ results: Amity.StreamPayload } & Amity.Pagination>(
    `/api/v3/video-streaming`,
    {
      params: {
        ...params,
        options,
      },
    },
  );

  // API-FIX: backend to response Amity.Response: const { paging, videoStreamings } = unwrapPayload(data)
  // API-FIX: seems returned data has a results identifier on top of data, like no other apis, and this is beautiful
  const { paging, results: payload } = data;
  const { videoStreamings } = payload;

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(payload as Amity.StreamPayload, { cachedAt });

  return { data: videoStreamings, cachedAt, paging };
};
/* end_public_function */
