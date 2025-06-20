import { getActiveClient } from '~/client/api';

import { ingestInCache } from '~/cache/api/ingestInCache';
import { LinkedObject } from '~/utils/linkedObject';

/* begin_public_function
  id: stream.update
*/
/**
 * ```js
 * import { updateStream } from '@amityco/ts-sdk'
 * const updated = await updateStream(streamId, { title: 'foobar' })
 * ```
 *
 * Updates an {@link Amity.Stream}
 *
 * @param streamId The ID of the {@link Amity.Stream} to edit
 * @param patch The patch data to apply
 * @returns the updated {@link Amity.Stream} object
 *
 * @category Stream API
 * @async
 */
export const updateStream = async (
  streamId: Amity.Stream['streamId'],
  patch: Patch<Amity.Stream, 'title' | 'thumbnailFileId' | 'description' | 'metadata'>,
): Promise<Amity.Cached<Amity.Stream>> => {
  const client = getActiveClient();
  client.log('stream/updateStream', streamId, patch);

  const { data } = await client.http.put<Amity.StreamPayload>(
    `/api/v3/video-streaming/${streamId}`,
    patch,
  );

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(data, { cachedAt });

  const { videoStreamings } = data;

  return {
    data: LinkedObject.stream(videoStreamings.find(stream => stream.streamId === streamId)!),
    cachedAt,
  };
};
/* end_public_function */
