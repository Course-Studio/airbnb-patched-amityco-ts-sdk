import { getActiveClient } from '~/client/api';
import { pullFromCache, upsertInCache } from '~/cache/api';
import { fireEvent } from '~/core/events';

import { getMessage } from '../internalApi/getMessage';
import { LinkedObject } from '~/utils/linkedObject';

/* begin_public_function
  id: message.soft_delete
*/
/**
 * ```js
 * import { softDeleteMessage } from '@amityco/ts-sdk'
 * const success = await softDeleteMessage('foobar')
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
export const softDeleteMessage = async (
  messageId: Amity.Message['messageId'],
): Promise<Amity.Message> => {
  const client = getActiveClient();
  client.log('message/softDeleteMessage', messageId);

  // API-FIX: This endpoint has not been implemented yet.
  await client.http.delete<{ success: boolean }>(
    `/api/v5/messages/${encodeURIComponent(messageId)}`,
  );

  const deleted = await getMessage(messageId);

  fireEvent('local.message.deleted', { messages: [deleted.data] });

  return LinkedObject.message(deleted.data);
};

/**
 * ```js
 * import { softDeleteMessage } from '@amityco/ts-sdk'
 * const success = softDeleteMessage.optimistically('foobar')
 * ```
 *
 * Deletes a {@link Amity.Message}
 *
 * @param messageId The {@link Amity.Message} ID to delete
 * @return A success boolean if the {@link Amity.Message} was deleted
 *
 * @category Message API
 */
softDeleteMessage.optimistically = (
  messageId: Amity.Message['messageId'],
): Amity.Cached<Amity.Message> | undefined => {
  const client = getActiveClient();
  client.log('message/softDeleteMessage.optimistically', messageId);

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
/* end_public_function */
