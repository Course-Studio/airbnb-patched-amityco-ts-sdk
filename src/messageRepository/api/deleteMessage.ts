import { getActiveClient } from '~/client/api';
import { pullFromCache, upsertInCache } from '~/cache/api';
import { fireEvent } from '~/core/events';
import { LinkedObject } from '~/utils/linkedObject';
import { prepareMessagePayload } from '../utils';
/**
 * ```js
 * import { deleteMessage } from '@amityco/ts-sdk'
 * const success = await deleteMessage('foobar')
 * ```
 *
 * Delete a {@link Amity.Message}
 *
 * @param messageId the ID of the {@link Amity.Message} to delete
 * @return A success boolean if the {@link Amity.Message} was deleted
 *
 * @category Message API
 * @async
 */
export const deleteMessage = async (
  messageId: Amity.Message['messageId'],
): Promise<Amity.Message> => {
  const client = getActiveClient();
  client.log('message/deleteMessage', messageId);

  // API-FIX: This endpoint has not been implemented yet.
  const { data: deleted } = await client.http.delete<Amity.MessagePayload>(
    `/api/v5/messages/${encodeURIComponent(messageId)}`,
  );

  const payload = await prepareMessagePayload(deleted);

  fireEvent('local.message.deleted', {
    messages: [payload.messages[0]],
  });
  return LinkedObject.message(payload.messages[0]);
};

/**
 * ```js
 * import { deleteMessage } from '@amityco/ts-sdk'
 * const success = deleteMessage.optimistically('foobar')
 * ```
 *
 * Deletes a {@link Amity.Message}
 *
 * @param messageId The {@link Amity.Message} ID to delete
 * @return A success boolean if the {@link Amity.Message} was deleted
 *
 * @category Message API
 */
deleteMessage.optimistically = (
  messageId: Amity.Message['messageId'],
): Amity.Cached<Amity.Message> | undefined => {
  const client = getActiveClient();
  client.log('message/deleteMessage.optimistically', messageId);

  const message = pullFromCache<Amity.InternalMessage>(['message', 'get', messageId]);

  if (!message) return;
  const cachedAt = -1;
  const deleted: Amity.InternalMessage = {
    ...message.data,
    isDeleted: true,
    updatedAt: new Date().toISOString(),
  };
  upsertInCache(['message', 'get', messageId], deleted, { cachedAt });
  fireEvent('local.message.deleted', { messages: [deleted] });
  return {
    data: LinkedObject.message(deleted),
    cachedAt,
  };
};
