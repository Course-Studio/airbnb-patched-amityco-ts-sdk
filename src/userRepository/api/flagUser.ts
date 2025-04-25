import { getActiveClient } from '~/client/api/activeClient';

import { ingestInCache } from '~/cache/api/ingestInCache';
import { fireEvent } from '~/core/events';
import { prepareUserPayload } from '~/userRepository/utils/prepareUserPayload';

/* begin_public_function
  id: user.flag
*/
/**
 * ```js
 * import { UserRepository } from '@amityco/ts-sdk'
 * const flagged = await UserRepository.flagUser('userId')
 * ```
 *
 * @param userId The ID of the user to add a be flagged
 * @returns the created report result
 *
 * @category User API
 * @async
 * */
export const flagUser = async (userId: Amity.User['userId']): Promise<boolean> => {
  const client = getActiveClient();
  client.log('user/flagUser', userId);

  const { data } = await client.http.post<Amity.UserPayload>(
    `api/v4/me/flags/${encodeURIComponent(userId)}`,
  );

  const payload = prepareUserPayload(data);

  if (client.cache) {
    ingestInCache(payload);
  }

  fireEvent('user.flagged', data);

  return !!payload;
};
/* end_public_function */
