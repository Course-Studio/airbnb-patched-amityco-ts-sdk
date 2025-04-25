import { getActiveClient } from '~/client/api';

import { pullFromCache, pushToCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { getResolver } from '~/core/model';
import { fireEvent } from '~/core/events';
import { prepareUserPayload } from '~/userRepository/utils/prepareUserPayload';

/**
 * ```js
 * import { queryUsers } from '@amityco/ts-sdk'
 * const { data: users, prevPage, nextPage } = await queryUsers({ displayName: 'foo' })
 * ```
 *
 * Queries a paginable list of {@link Amity.InternalUser} objects
 * Search is performed by displayName such as `.startsWith(search)`
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.InternalUser} objects
 *
 * @category User API
 * @async
 */
export const queryUsers = async (
  query: Amity.QueryUsers = {},
): Promise<Amity.Cached<Amity.PageToken<Amity.InternalUser>>> => {
  const client = getActiveClient();
  client.log('user/queryUsers', query);

  const { page, limit = 10, filter = 'all', sortBy = 'displayName', ...params } = query;

  const { data } = await client.http.get<Amity.UserPayload & Amity.Pagination>(`/api/v3/users`, {
    params: {
      ...params,
      filter,
      sortBy,
      options: page ? { token: page } : { limit },
    },
  });

  // unpacking
  const { paging, ...rawPayload } = data;
  const { users } = rawPayload;

  const cachedAt = client.cache && Date.now();

  const payload = prepareUserPayload(rawPayload);

  if (client.cache) {
    ingestInCache(payload, { cachedAt });

    /*
     * using a query as a cache key over params because if the keyword, filter, sort
     * change the API will NOT cache results, when it should
     */
    const cacheKey = [
      'user',
      'query',
      { ...query, options: { limit, token: page } } as Amity.Serializable,
    ];
    pushToCache(cacheKey, { users: users.map(getResolver('user')), paging });
  }

  fireEvent('user.fetched', data);

  return {
    data: payload.users,
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
 * Queries a paginable list of {@link Amity.InternalUser} objects from cache
 * Search is performed by displayName such as `.startsWith(search)`
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.InternalUser} objects
 *
 * @category User API
 */
queryUsers.locally = (
  query: Parameters<typeof queryUsers>[0] = {},
): Amity.Cached<Amity.PageToken<Amity.InternalUser>> | undefined => {
  const client = getActiveClient();
  client.log('user/queryUsers.locally', query);

  if (!client.cache) return;

  const { limit = 10, page } = query ?? {};

  const cacheKey = [
    'user',
    'query',
    {
      ...query,
      options: {
        limit,
        token: page,
      },
    } as Amity.Serializable,
  ];

  const { data, cachedAt } =
    pullFromCache<{ users: Pick<Amity.InternalUser, 'userId'>[] } & Amity.Pagination>(cacheKey) ??
    {};

  const users: Amity.InternalUser[] =
    data?.users
      .map(userId => pullFromCache<Amity.InternalUser>(['user', 'get', userId])!)
      .filter(Boolean)
      .map(({ data }) => data) ?? [];

  return users.length > 0 && users.length === data?.users?.length
    ? {
        data: users,
        cachedAt,
        paging: data?.paging,
      }
    : undefined;
};
