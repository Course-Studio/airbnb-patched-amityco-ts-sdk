import { getActiveClient } from '~/client/api/activeClient';

import { ingestInCache } from '~/cache/api/ingestInCache';
import { fireEvent } from '~/core/events';

import { prepareMessagePayload } from '~/messageRepository/utils';

/* begin_public_function
  id: message.flag
*/
/**
 * ```js
 * import { MessageRepository } from '@amityco/ts-sdk'
 * const flagged = await MessageRepository.flagMessage(messageId)
 * ```
 *
 * @param messageId of the message to flag
 * @returns the created report result
 *
 * @category Message API
 * @async
 * */
export const flagMessage = async (messageId: Amity.Message['messageId']): Promise<boolean> => {
  const client = getActiveClient();
  client.log('message/flag', messageId);

  const { data: payload } = await client.http.post<Amity.MessagePayload>(
    `/api/v5/messages/${encodeURIComponent(messageId)}/flags`,
  );

  if (client.cache) {
    const messagePayload = await prepareMessagePayload(payload);
    ingestInCache(messagePayload);
  }

  fireEvent('message.flagged', payload);

  return !!payload;
};
/* end_public_function */
