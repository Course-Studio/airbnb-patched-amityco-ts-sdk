import { LinkedObject } from '~/utils/linkedObject';
import { queryUsers as queryUsersInternal } from '../internalApi/queryUsers';

/**
 * ```js
 * import { queryUsers } from '@amityco/ts-sdk'
 * const { data: users, prevPage, nextPage } = await queryUsers({ displayName: 'foo' })
 * ```
 *
 * Queries a paginable list of {@link Amity.User} objects
 * Search is performed by displayName such as `.startsWith(search)`
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.User} objects
 *
 * @category User API
 * @async
 */
export const queryUsers = async (
  query: Amity.QueryUsers = {},
): Promise<Amity.Cached<Amity.PageToken<Amity.User>>> => {
  const { cachedAt, data, paging } = await queryUsersInternal(query);

  return {
    data: data.map(user => LinkedObject.user(user)),
    cachedAt,
    paging,
  };
};

/**
 * ```js
 * import { queryUsers } from '@amityco/ts-sdk'
 * const { data: users } = queryUsers.locally({ keyword: 'foo' })
 * ```
 *
 * Queries a paginable list of {@link Amity.User} objects from cache
 * Search is performed by displayName such as `.startsWith(search)`
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.User} objects
 *
 * @category User API
 */
queryUsers.locally = (
  query: Parameters<typeof queryUsers>[0] = {},
): Amity.Cached<Amity.PageToken<Amity.User>> | undefined => {
  const cache = queryUsersInternal.locally(query);

  if (!cache) return;

  const { cachedAt, data, paging } = cache;

  return {
    data: data.map(LinkedObject.user),
    cachedAt,
    paging,
  };
};
