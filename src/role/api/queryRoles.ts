import { getActiveClient } from '~/client/api';

import { toPage, toToken } from '~/core/query';
import { ingestInCache } from '~/cache/api/ingestInCache';

/**
 * ```js
 * import { queryRoles } from '@amityco/ts-sdk'
 * const roles = await queryRoles()
 * ```
 *
 * Queries a paginable list of {@link Amity.Role} objects
 * Search is performed by displayName such as `.startsWith(search)`
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.Role} objects
 *
 * @category Role API
 * @async
 */
export const queryRoles = async (query?: {
  displayName?: Amity.Role['displayName'];
  sortBy?: 'displayName' | 'firstCreated' | 'lastCreated';
  limit?: number;
  queryToken?: string;
}): Promise<Amity.Cached<Amity.Paged<Amity.Role>> & Amity.Pagination> => {
  const client = getActiveClient();
  client.log('role/queryRoles', query);

  const { limit = 10, queryToken, displayName, sortBy, ...params } = query ?? {};

  const options = (() => {
    if (queryToken) return { token: queryToken };

    if (limit) return { limit };

    return undefined;
  })();

  // API-FIX: parameters should be querystring.
  const { data } = await client.http.get<Amity.RolePayload & Amity.Pagination>(`/api/v3/roles`, {
    params: {
      ...params,
      keyword: displayName,
      sortBy,
      options,
    },
  });

  const { paging, ...payload } = data;
  const { roles } = payload;

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(payload as Amity.RolePayload, { cachedAt });

  const nextPage = toPage(paging.next);
  const prevPage = toPage(paging.previous);

  return { data: roles, cachedAt, prevPage, nextPage, paging };
};

/**
 * ```js
 * import { queryRoles } from '@amityco/ts-sdk'
 * const roles = queryRoles.locally({ keyword: 'foo' })
 * ```
 *
 * Queries a paginable list of {@link Amity.Role} objects from cache
 * Search is performed by displayName such as `.startsWith(search)`
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.Role} objects
 *
 * @category Role API
 */
queryRoles.locally = (query: Parameters<typeof queryRoles>[0]) => {
  const client = getActiveClient();
  client.log('role/queryRoles.locally', query);

  // TODO
};
