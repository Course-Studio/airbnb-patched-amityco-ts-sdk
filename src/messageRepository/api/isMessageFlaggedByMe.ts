import { getActiveClient } from '~/client/api/activeClient';

/* begin_public_function
  id: message.check_flag_by_me
*/
/**
 * ```js
 * import { MessageRepository } from '@amityco/ts-sdk'
 * const isReportedByMe = await MessageRepository.isMessageFlaggedByMe(messageId)
 * ```
 *
 * @param messageId of the message to check a report of.
 * @returns `true` if the report is created by me, `false` if doesn't.
 *
 * @category Report API
 * @async
 * */
export const isMessageFlaggedByMe = async (
  messageId: Amity.Message['messageId'],
): Promise<boolean> => {
  const client = getActiveClient();
  client.log('message/isMessageFlaggedByMe', messageId);

  const { data } = await client.http.get<{ result: boolean }>(
    `/api/v5/messages/${encodeURIComponent(messageId)}/flags`,
  );

  return data.result;
};
/* end_public_function */
