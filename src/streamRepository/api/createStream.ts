import { getActiveClient } from '~/client/api';

import { ingestInCache } from '~/cache/api/ingestInCache';
import { LinkedObject } from '~/utils/linkedObject';

/* begin_public_function
  id: stream.create
*/
/**
 * ```js
 * import { createStream } from '@amityco/ts-sdk'
 * const created = await createStream({ title: 'my stream', 'thumbnailFileId': fileId  })
 * ```
 *
 * Creates an {@link Amity.InternalStream}
 *
 * @param bundle The data necessary to create a new {@link Amity.InternalStream}
 * @returns The newly created {@link Amity.InternalStream}
 *
 * @category Stream API
 * @async
 */
export const createStream = async (
  bundle: Pick<Amity.InternalStream, 'title' | 'thumbnailFileId' | 'description'> & {
    isSecure?: boolean;
  },
): Promise<Amity.Cached<Amity.Stream>> => {
  const client = getActiveClient();
  client.log('stream/createStream', bundle);

  const { data } = await client.http.post<Amity.StreamPayload>('/api/v3/video-streaming', bundle);

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(data, { cachedAt });

  const { videoStreamings } = data;

  return {
    data: LinkedObject.stream(videoStreamings[0]),
    cachedAt,
  };
};
/* end_public_function */
