import { getActiveClient } from '~/client/api';

import { ingestInCache } from '~/cache/api/ingestInCache';
import { pullFromCache, upsertInCache } from '~/cache/api';
import { fireEvent } from '~/core/events';

import { convertParams, prepareMessagePayload } from '../utils';
import { LinkedObject } from '~/utils/linkedObject';

/* begin_public_function
  id: message.edit
*/
/**
 * ```js
 * import { updateMessage } from '@amityco/ts-sdk'
 * const updated = await updateMessage(messageId, {
 *   data: { text: 'hello world' }
 * })
 * ```
 *
 * Updates an {@link Amity.Message}
 *
 * @param messageId The ID of the {@link Amity.Message} to edit
 * @param patch The patch data to apply
 * @returns the updated {@link Amity.Message} object
 *
 * @category Message API
 * @async
 */
export const updateMessage = async (
  messageId: Amity.Message['messageId'],
  patch: Patch<Amity.Message, 'data' | 'tags' | 'metadata' | 'mentionees'>,
): Promise<Amity.Cached<Amity.Message>> => {
  const client = getActiveClient();
  client.log('message/updateMessage', patch);

  console.warn(
    'MessageRepository.updateMessage will be replaced with MessageRepository.editMessage',
  );

  const { data: payload } = await client.http.put<Amity.MessagePayload>(
    `/api/v5/messages/${encodeURIComponent(messageId)}`,
    convertParams(patch),
  );

  const data = await prepareMessagePayload(payload);

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(data, { cachedAt });

  const { messages } = data;

  fireEvent('local.message.updated', { messages });

  return {
    data: LinkedObject.message(messages.find(message => message.messageId === messageId)!),
    cachedAt,
  };
};

/**
 * ```js
 * import { updateMessage } from '@amityco/ts-sdk'
 * const updated = updateMessage.optimistically('foobar', {
 *   data: { text: 'hello world' }
 * })
 * ```
 *
 * Updates an {@link Amity.Message} in cache
 *
 * @param messageId The ID of the {@link Amity.Message} to edit
 * @param patch The patch data to apply
 * @returns the updated {@link Amity.Message} object
 *
 * @category Message API
 */
updateMessage.optimistically = (
  messageId: Amity.Message['messageId'],
  patch: Patch<Amity.Message, 'data' | 'tags' | 'metadata' | 'mentionees'>,
): Amity.Cached<Amity.Message> | undefined => {
  const client = getActiveClient();
  client.log('message/updateMessage.optimistically', patch);

  if (!client.cache) return;

  const message = pullFromCache<Amity.InternalMessage>(['message', 'get', messageId]);

  if (!message) return;

  const cachedAt = -1;
  const updated: Amity.InternalMessage = {
    ...message.data,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  upsertInCache(['message', 'get', messageId], updated, { cachedAt });
  fireEvent('local.message.updated', { messages: [updated] });

  return {
    data: LinkedObject.message(updated),
    cachedAt,
  };
};
/* end_public_function */
