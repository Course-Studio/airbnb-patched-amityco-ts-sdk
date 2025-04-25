import { getActiveClient } from '~/client/api';

import { fireEvent } from '~/core/events';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { prepareUserPayload } from '~/userRepository/utils/prepareUserPayload';

/* begin_public_function
  id: client.update_user
*/
/**
 * ```js
 * import { updateUser } from '@amityco/ts-sdk'
 * const updated = await updateUser(userId, { displayName: 'foobar' })
 * ```
 *
 * Updates an {@link Amity.User}
 *
 * @param userId The ID of the {@link Amity.User} to update
 * @param patch The patch data to apply
 * @returns the updated {@link Amity.User} object
 *
 * @category User API
 * @async
 */
export const updateUser = async (
  userId: Amity.User['userId'],
  patch: Patch<
    Amity.User,
    'displayName' | 'description' | 'avatarFileId' | 'avatarCustomUrl' | 'metadata'
  >,
): Promise<Amity.Cached<Amity.User>> => {
  const client = getActiveClient();
  client.log('user/updateUser', userId, patch);

  const { data } = await client.http.put<Amity.UserPayload>(`/api/v3/users/`, {
    userId,
    ...patch,
    createNewUserWhenNotFound: false,
  });

  const payload = prepareUserPayload(data);

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(payload, { cachedAt });

  fireEvent('user.updated', data);

  return {
    data: payload.users.find(user => user.userId === userId)!,
    cachedAt,
  };
};
/* end_public_function */
