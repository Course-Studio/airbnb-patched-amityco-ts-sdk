import { getActiveClient } from '~/client/api/activeClient';

import { ingestInCache } from '~/cache/api/ingestInCache';
import { fireEvent } from '~/core/events';
import { prepareUserPayload } from '~/userRepository/utils/prepareUserPayload';

/* begin_public_function
  id: user.unflag
*/
/**
 * ```js
 * import { UserRepository } from '@amityco/ts-sdk'
 * const unflagged = await UserRepository.unflagUser('post', postId)
 * ```
 *
 * @param userId The ID of the user to unflag
 * @returns the deleted report result
 *
 * @category User API
 * @async
 * */
export const unflagUser = async (userId: Amity.User['userId']): Promise<boolean> => {
  const client = getActiveClient();
  client.log('user/unflag', userId);

  const { data } = await client.http.delete<Amity.UserPayload>(
    `/api/v4/me/flags/${encodeURIComponent(userId)}`,
  );

  const payload = prepareUserPayload(data);

  if (client.cache) {
    ingestInCache(payload);
  }

  fireEvent('user.unflagged', data);

  return !!payload;
};
/* end_public_function */
