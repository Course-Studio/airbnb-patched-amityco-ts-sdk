import { getActiveClient } from '~/client/api/activeClient';

import { ingestInCache } from '~/cache/api/ingestInCache';

import { fireEvent } from '~/core/events';
import { prepareMessagePayload } from '~/messageRepository/utils';

/* begin_public_function
  id: message.unflag
*/
/**
 * ```js
 * import { MessageRepository } from '@amityco/ts-sdk'
 * const unflagged = await MessageRepository.unflag(messageId)
 * ```
 *
 * @param messageId of the message to unflag
 * @returns boolean to indicate success
 *
 * @category Report API
 * @async
 * */
export const unflagMessage = async (messageId: Amity.Message['messageId']): Promise<boolean> => {
  const client = getActiveClient();
  client.log('message/unflag', messageId);

  const { data: payload } = await client.http.delete<Amity.MessagePayload>(
    `/api/v5/messages/${encodeURIComponent(messageId)}/flags`,
  );

  if (client.cache) {
    const messagePayload = await prepareMessagePayload(payload);
    ingestInCache(messagePayload);
  }

  fireEvent('message.unflagged', payload);

  return !!payload;
};
/* end_public_function */
