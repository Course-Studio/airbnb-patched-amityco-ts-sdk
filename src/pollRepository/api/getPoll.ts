import { getActiveClient } from '~/client/api';

import { pullFromCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';

/* begin_public_function
  id: poll.get
*/
/**
 * ```js
 * import { getPoll } from '@amityco/ts-sdk'
 * const poll = await getPoll('foobar')
 * ```
 *
 * Fetches a {@link Amity.Poll} object
 *
 * @param pollId the ID of the {@link Amity.Poll} to fetch
 * @returns the associated {@link Amity.Poll} object
 *
 * @category Poll API
 * @async
 */
export const getPoll = async (pollId: Amity.Poll['pollId']): Promise<Amity.Cached<Amity.Poll>> => {
  const client = getActiveClient();
  client.log('poll/getPoll', pollId);

  const { data } = await client.http.get<Amity.PollPayload>(`/api/v3/polls/${pollId}`);

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(data, { cachedAt });

  const { polls } = data;

  return {
    data: polls.find(poll => poll.pollId === pollId)!,
    cachedAt,
  };
};
/* end_public_function */

/**
 * ```js
 * import { getPoll } from '@amityco/ts-sdk'
 * const poll = getPoll.locally('foobar')
 * ```
 *
 * Fetches a {@link Amity.Poll} object
 *
 * @param pollId the ID of the {@link Amity.Poll} to fetch
 * @returns the associated {@link Amity.Poll} object
 *
 * @category Poll API
 */
getPoll.locally = (pollId: Amity.Poll['pollId']): Amity.Cached<Amity.Poll> | undefined => {
  const client = getActiveClient();
  client.log('poll/getPoll', pollId);

  if (!client.cache) return;

  const cached = pullFromCache<Amity.Poll>(['poll', 'get', pollId]);

  if (!cached) return;

  return {
    data: cached.data,
    cachedAt: cached.cachedAt,
  };
};
