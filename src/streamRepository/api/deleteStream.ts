import { getActiveClient } from '~/client/api';

import { upsertInCache } from '~/cache/api';

import { getStream } from '../internalApi/getStream';

// import { unwrapPayload } from '~/core/transports'

/* begin_public_function
  id: stream.delete
*/
/**
 * ```js
 * import { deleteStream } from '@amityco/ts-sdk'
 * const success = await deleteStream(streamId)
 * ```
 *
 * Deletes a {@link Amity.InternalStream}
 *
 * @param streamId The {@link Amity.InternalStream} ID to delete
 * @return A success boolean if the {@link Amity.InternalStream} was deleted
 *
 * @category Stream API
 * @async
 */
export const deleteStream = async (
  streamId: Amity.InternalStream['streamId'],
): Promise<boolean> => {
  const client = getActiveClient();
  client.log('stream/deleteStream', streamId);

  const stream = await getStream(streamId);

  // API-FIX: it returns { success: boolean } but seems it should be Amity.Response<{ success: boolean }
  // API-FIX: swagger docs are wrong!
  const { data } = await client.http.delete<{ success: boolean }>(
    `/api/v3/video-streaming/${streamId}`,
  );

  const { success } = data; // unwrapPayload(data)
  const deleted = { ...stream.data, isDeleted: true };

  upsertInCache(['stream', 'get', streamId], deleted);

  return success;
};
/* end_public_function */
