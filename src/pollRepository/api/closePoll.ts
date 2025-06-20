import { fireEvent } from '~/core/events';
import { getActiveClient } from '~/client/api';

import { ingestInCache } from '~/cache/api/ingestInCache';

/* begin_public_function
  id: poll.close
*/
/**
 * ```js
 * import { closePoll } from '@amityco/ts-sdk'
 * const updated = await closePoll(pollId)
 * ```
 *
 * Updates an {@link Amity.Poll}
 *
 * @param pollId The ID of the {@link Amity.Poll} to close
 * @returns the updated {@link Amity.Poll} object
 *
 * @category Poll API
 * @async
 */
export const closePoll = async (
  pollId: Amity.Poll['pollId'],
): Promise<Amity.Cached<Amity.Poll>> => {
  const client = getActiveClient();
  client.log('user/closePoll', pollId);

  const { data } = await client.http.put<Amity.PollPayload>(
    `/api/v3/polls/${encodeURIComponent(pollId)}`,
    { status: 'closed' },
  );

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(data, { cachedAt });

  fireEvent('poll.updated', data);

  const { polls } = data;

  return {
    data: polls.find(poll => poll.pollId === pollId)!,
    cachedAt,
  };
};
/* end_public_function */
