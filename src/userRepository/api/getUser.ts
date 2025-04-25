import { LinkedObject } from '~/utils/linkedObject';
import { getUser as getUserInternal } from '../internalApi/getUser';

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
export const getUser = async (userId: Amity.User['userId']): Promise<Amity.Cached<Amity.User>> => {
  const { data, cachedAt } = await getUserInternal(userId);

  return {
    data: LinkedObject.user(data),
    cachedAt,
  };
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
getUser.locally = (userId: Amity.User['userId']): Amity.Cached<Amity.User> | undefined => {
  const cached = getUserInternal.locally(userId);

  if (!cached) return;

  return {
    data: LinkedObject.user(cached.data),
    cachedAt: cached.cachedAt,
  };
};
