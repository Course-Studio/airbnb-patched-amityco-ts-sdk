import { fireEvent } from '~/core/events';
import { getActiveClient } from '~/client/api';

import { upsertInCache } from '~/cache/api';

import { getPoll } from './getPoll';

/* begin_public_function
  id: poll.delete
*/
/**
 * ```js
 * import { deletePoll } from '@amityco/ts-sdk'
 * const success = await deletePoll(pollId)
 * ```
 *
 * Deletes a {@link Amity.Poll}
 *
 * @param pollId The {@link Amity.Poll} ID to delete
 * @return A success boolean if the {@link Amity.Poll} was deleted
 *
 * @category Poll API
 * @async
 */
export const deletePoll = async (pollId: Amity.Poll['pollId']): Promise<boolean> => {
  const client = getActiveClient();
  client.log('poll/deletePoll', pollId);

  const poll = await getPoll(pollId);

  // API-FIX: it returns { success: boolean } but seems it should be Amity.Response<{ success: boolean }
  const { data } = await client.http.delete<{ success: boolean }>(`/api/v3/polls/${pollId}`);

  const { success } = data; // unwrapPayload(data)
  const deleted = { ...poll.data, isDeleted: true };

  upsertInCache(['poll', 'get', pollId], deleted);

  fireEvent('poll.deleted', { polls: [deleted], users: [] });

  return success;
};
/* end_public_function */
