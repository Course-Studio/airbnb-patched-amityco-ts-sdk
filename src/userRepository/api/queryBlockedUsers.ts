import { getActiveClient } from '~/client/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { pullFromCache, pushToCache } from '~/cache/api';
import { getResolver } from '~/core/model';
import { toPageRaw } from '~/core/query';
import { prepareUserPayload } from '~/userRepository/utils/prepareUserPayload';

/**
 * ```js
 * import { UserRepository } from '@amityco/ts-sdk'
 * const { data: users, prevPage, nextPage, total } = await UserRepository.queryBlockedUsers({ page: Amity.PageRaw, limit: number })
 * ```
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.User} objects
 *
 * @category Block API
 * @async
 */

export const queryBlockedUsers = async (
  query?: Amity.QueryBlockedUser,
): Promise<
  Amity.Cached<Amity.Paged<Amity.User, Amity.PageRaw>> & {
    total: number;
  }
> => {
  const client = getActiveClient();

  let params = {};

  if (query) {
    const { token, limit } = query;
    params = {
      limit,
      token,
    };
  }

  client.log('user/queryBlockedUsers');
  const { data } = await client.http.get<Amity.BlockedUserPayload>('/api/v4/me/user-blocks', {
    params,
  });

  const payload = prepareUserPayload(data);

  const cachedAt = client.cache && Date.now();

  if (client.cache) {
    ingestInCache(payload, { cachedAt });

    const cacheKey = ['blockedUsers', 'query', params as Amity.Serializable];
    pushToCache(cacheKey, { users: payload.users.map(getResolver('user')), paging: data.paging });
  }

  const { next, previous, total } = data.paging;
  const nextPage = toPageRaw(next);
  const prevPage = toPageRaw(previous);

  return { data: payload.users, prevPage, nextPage, total, cachedAt };
};

/**
 * ```js
 * import { queryBlockedUsers } from '@amityco/ts-sdk'
 * const { data: users } = queryBlockedUsers.locally({ page: 'page_token' })
 * ```
 *
 * Queries a paginable list of {@link Amity.User} objects from cache
 * Search is performed by displayName such as `.startsWith(search)`
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.User} objects
 *
 * @category Block API
 */
queryBlockedUsers.locally = (
  query: Parameters<typeof queryBlockedUsers>[0] = {},
):
  | (Amity.Cached<Amity.Paged<Amity.InternalUser, Amity.PageRaw>> & {
      total: number;
    })
  | undefined => {
  const client = getActiveClient();
  client.log('user/queryBlockedUsers.locally');

  if (!client.cache) return;

  let params = {};
  if (query) {
    const { token, limit } = query;
    params = {
      token,
      limit,
    };
  }

  const cacheKey = ['blockedUsers', 'query', params as Amity.Serializable];

  const { data, cachedAt } =
    pullFromCache<{ users: Pick<Amity.InternalUser, 'userId'>[] } & Amity.BlockedUserPaged>(
      cacheKey,
    ) ?? {};

  const users: Amity.InternalUser[] =
    data?.users
      .map(userId => pullFromCache<Amity.InternalUser>(['user', 'get', userId])!)
      .filter(Boolean)
      .map(({ data }) => data) ?? [];

  const nextPage = toPageRaw(data?.paging.next);
  const prevPage = toPageRaw(data?.paging.previous);

  return users.length > 0 && users.length === data?.users?.length
    ? { data: users, nextPage, prevPage, total: data?.paging.total, cachedAt }
    : undefined;
};
