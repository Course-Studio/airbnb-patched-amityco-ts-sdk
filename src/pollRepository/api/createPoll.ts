import { getActiveClient } from '~/client/api';

import { ingestInCache } from '~/cache/api/ingestInCache';

/* begin_public_function
  id: poll.create
*/
/**
 * ```js
 * import { createPoll } from '@amityco/ts-sdk'
 * const created = await createPoll({
 *   question: 'question',
 *   answers: [
 *      { dataType: 'text', data: 'answer1' },
 *      { dataType: 'text', data: 'answer2' },
 *   ],
 *   closedIn: 1649136484
 * }))
 * ```
 *
 * Creates an {@link Amity.Poll}
 *
 * @param bundle The data necessary to create a new {@link Amity.Poll}
 * @returns The newly created {@link Amity.Poll}
 *
 * @category Poll API
 * @async
 */
export const createPoll = async (
  bundle: Pick<Amity.Poll, 'question' | 'answerType' | 'closedIn'> & {
    answers: Pick<Amity.PollAnswer, 'dataType' | 'data'>[];
  },
): Promise<Amity.Cached<Amity.Poll>> => {
  const client = getActiveClient();
  client.log('post/createPoll', bundle);

  const { data } = await client.http.post<Amity.PollPayload>('/api/v3/polls', bundle);

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(data, { cachedAt });

  const { polls } = data;

  return {
    data: polls[0],
    cachedAt,
  };
};
/* end_public_function */
