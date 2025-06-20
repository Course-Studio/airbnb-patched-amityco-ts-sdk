import { fireEvent } from '~/core/events';
import { getActiveClient } from '~/client/api';

import { ingestInCache } from '~/cache/api/ingestInCache';

/* begin_public_function
  id: poll.vote
*/
/**
 * ```js
 * import { votePoll } from '@amityco/ts-sdk'
 * const voted = await votePoll(pollId)
 * ```
 *
 * Votes for an {@link Amity.Poll}
 *
 * @param pollId The ID of the {@link Amity.Poll} to vote
 * @param answerIds The IDs of the {@link Amity.Poll} answers to vote {@link Amity.Poll}
 * @returns the updated {@link Amity.Poll} object
 *
 * @category Poll API
 * @async
 */
export const votePoll = async (
  pollId: Amity.Poll['pollId'],
  answerIds: string[],
): Promise<Amity.Cached<Amity.Poll>> => {
  const client = getActiveClient();
  client.log('user/votePoll', pollId);

  const { data } = await client.http.post<Amity.PollPayload>(
    `/api/v3/polls/${encodeURIComponent(pollId)}/votes`,
    { pollId, answerIds },
  );

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(data, { cachedAt });

  const { polls } = data;

  fireEvent('poll.updated', data);

  return {
    data: polls.find(poll => poll.pollId === pollId)!,
    cachedAt,
  };
};
/* end_public_function */
