import { getActiveClient } from '~/client/api';

import { pullFromCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { fireEvent } from '~/core/events';

import { isInTombstone } from '~/cache/api/isInTombstone';
import { checkIfShouldGoesToTombstone } from '~/cache/utils';
import { pushToTombstone } from '~/cache/api/pushToTombstone';
import { prepareUserPayload } from '~/userRepository/utils/prepareUserPayload';

/**
 * ```js
 * import { getUser } from '~/user/api'
 * const { data: user } = await getUser('foobar')
 * ```
 *
 * Fetches a {@link Amity.User} object
 *
 * @param userId the ID of the {@link Amity.User} to fetch
 * @returns the associated {@link Amity.User} object
 *
 * @category Private
 * @async
 */
export const getUser = async (
  userId: Amity.User['userId'],
): Promise<Amity.Cached<Amity.InternalUser>> => {
  const client = getActiveClient();
  client.log('user/getUser', userId);

  isInTombstone('user', userId);

  try {
    const { data } = await client.http.get<Amity.UserPayload>(
      `/api/v3/users/${encodeURIComponent(userId)}`,
    );

    const cachedAt = client.cache && Date.now();
    const payload = prepareUserPayload(data);
    if (client.cache) ingestInCache(payload, { cachedAt });

    fireEvent('user.fetched', data);

    return {
      data: payload.users.find(user => user.userId === userId)!,
      cachedAt,
    };
  } catch (error) {
    if (checkIfShouldGoesToTombstone((error as Amity.ErrorResponse)?.code)) {
      pushToTombstone('user', userId);
    }

    throw error;
  }
};

/**
 * ```js
 * import { getUser } from '@amityco/ts-sdk'
 * const { data: user } = getUser.locally('foobar')
 * ```
 *
 * Fetches a {@link Amity.User} object from cache
 *
 * @param userId the ID of the {@link Amity.User} to fetch
 * @returns the associated {@link Amity.User} object
 *
 * @category User API
 */
getUser.locally = (userId: Amity.User['userId']): Amity.Cached<Amity.InternalUser> | undefined => {
  const client = getActiveClient();
  client.log('user/getUser.locally', userId);

  if (!client.cache) return;

  const cached = pullFromCache<Amity.InternalUser>(['user', 'get', userId]);

  if (!cached) return;

  return {
    data: cached.data,
    cachedAt: cached.cachedAt,
  };
};
