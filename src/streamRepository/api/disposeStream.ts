import { getActiveClient } from '~/client/api';

import { ingestInCache } from '~/cache/api/ingestInCache';

/**
 * ```js
 * import { disposeStream } from '@amityco/ts-sdk'
 * const stream = await disposeStream(streamId)
 * ```
 *
 * Dispose a {@link Amity.InternalStream}.
 * Streaming status will be updated to "ended" and streaming url will be invalidated
 *
 * @param streamId The {@link Amity.InternalStream} ID to dispose
 * @returns the associated {@link Amity.InternalStream} object
 *
 * @category Stream API
 * @async
 */
export const disposeStream = async (
  streamId: Amity.InternalStream['streamId'],
): Promise<Amity.Cached<Amity.InternalStream>> => {
  const client = getActiveClient();
  client.log('stream/disposeStream', streamId);

  const { data } = await client.http.delete<Amity.StreamPayload>(
    `/api/v3/video-streaming/${streamId}/streaming-url`,
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
