import { getActiveClient } from '~/client/api';

import { pullFromCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { fireEvent } from '~/core/events';
import { LinkedObject } from '~/utils/linkedObject';
import { prepareUserPayload } from '~/userRepository/utils/prepareUserPayload';

/* begin_public_function
  id: user.get_by_ids
*/
/**
 * ```js
 * import { getUsers } from '@amityco/ts-sdk'
 * const { data: users } = await getUsers(['foo', 'bar'])
 * ```
 *
 * Fetches a collection of {@link Amity.User} objects
 *
 * @param userIds the IDs of the {@link Amity.User} to fetch
 * @returns the associated collection of {@link Amity.User} objects
 *
 * @category User API
 * @async
 */
export const getUserByIds = async (
  userIds: Amity.User['userId'][],
): Promise<Amity.Cached<Amity.User[]>> => {
  const client = getActiveClient();
  client.log('user/getUsers', userIds);

  const encodedUserIds = userIds.map(userId => encodeURIComponent(userId));

  // API-FIX: endpoint should not be /list, parameters should be querystring.
  const { data } = await client.http.get<Amity.UserPayload>(`/api/v3/users/list`, {
    params: { userIds: encodedUserIds },
  });

  const payload = prepareUserPayload(data);

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(payload, { cachedAt });

  fireEvent('user.fetched', data);

  return {
    data: payload.users.map(user => LinkedObject.user(user)),
    cachedAt,
  };
};
/* end_public_function */

/**
 * ```js
 * import { getUsers } from '@amityco/ts-sdk'
 * const { data: users } = getUsers.locally!(['foo', 'bar'])
 * ```
 *
 * Fetches a collection of {@link Amity.User} objects from cache
 *
 * @param userIds the IDs of the {@link Amity.User} to fetch
 * @returns the associated collection of {@link Amity.User} objects
 *
 * @category User API
 */
getUserByIds.locally = (
  userIds: Amity.User['userId'][],
): Amity.Cached<Amity.User[]> | undefined => {
  const client = getActiveClient();
  client.log('user/getUsers.locally', userIds);

  if (!client.cache) return;

  const cached = userIds
    .map(userId => pullFromCache<Amity.InternalUser>(['user', 'get', userId])!)
    .filter(Boolean);

  const users = cached.map(({ data }) => LinkedObject.user(data));
  const oldest = cached.sort((a, b) => (a.cachedAt! < b.cachedAt! ? -1 : 1))?.[0];

  if (cached?.length < userIds.length) return;

  return {
    data: users,
    cachedAt: oldest.cachedAt,
  };
};
