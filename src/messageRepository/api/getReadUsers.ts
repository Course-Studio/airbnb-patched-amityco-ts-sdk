import { ingestInCache } from '~/cache/api/ingestInCache';
import { getActiveClient } from '~/client/api';
import { toPage, toToken } from '~/core/query';
import { pullFromCache, pushToCache } from '~/cache/api';
import { getUserByIds } from '~/userRepository';
import { convertSubChannelMarkerResponse } from '~/utils/marker';

/**
 * ```js
 * import { MessageRepository } from '@amityco/ts-sdk'
 * const { data: users, prevPage, nextPage } = await MessageRepository.getReadUsers({
 *   messageId: 'foo',
 *   memberships: ['member']
 * })
 * ```
 *
 * Queries a paginable list of read {@link Amity.InternalUser} by messageId
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.InternalUser} objects
 *
 * @category Message API
 * @async
 */
export const getReadUsers = async (
  query: Amity.QueryReadUsers,
): Promise<Amity.Cached<Amity.Paged<Amity.InternalUser>>> => {
  const client = getActiveClient();
  client.log('user/getReadUsers', query);

  const { page, messageId, ...params } = query;

  const { data } = await client.http.get<Amity.ReadUserPayload & Amity.Pagination>(
    `/api/v1/markers/messages/${messageId}/read-users`,
    {
      params: {
        ...params,
        options: {
          token: toToken(page, 'afterbeforeraw'),
        },
      },
    },
  );

  const { paging, publicUserIds: readUsers, userFeedMarkers, ...payload } = data;
  const cachedAt = client.cache && Date.now();

  if (client.cache) {
    ingestInCache(
      { ...payload, userFeedMarkers: convertSubChannelMarkerResponse(userFeedMarkers) },
      { cachedAt },
    );

    const cacheKey = [
      'read-user',
      'query',
      { messageId, ...params, options: { ...page } } as Amity.Serializable,
    ];

    pushToCache(cacheKey, { users: readUsers, paging });
  }

  let users: Amity.InternalUser[] = [];

  if (readUsers.length > 0) {
    ({ data: users } = await getUserByIds(readUsers));
  }

  const prevPage = toPage(paging.previous);
  const nextPage = toPage(paging.next);

  return { data: users, cachedAt, prevPage, nextPage };
};

/**
 * ```js
 * import { getReadUsers } from '@amityco/ts-sdk'
 * const { data: users } = getReadUsers.locally({
 *   messageId: 'foo',
 *   memberships: ['member']
 * })
 * ```
 *
 * Queries a paginable list of read {@link Amity.InternalUser} objects from cache
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.InternalUser} objects
 *
 * @category Message API
 */
getReadUsers.locally = (
  query: Amity.QueryReadUsers,
): Amity.Cached<Amity.Paged<Amity.InternalUser>> | undefined => {
  const client = getActiveClient();
  client.log('user/getReadUsers.locally', query);

  if (!client.cache) return;

  const { page, ...params } = query;

  const cacheKey = [
    'read-user',
    'query',
    { ...params, options: { ...page } } as Amity.Serializable,
  ];

  const { data, cachedAt } =
    pullFromCache<{ users: Pick<Amity.SubChannelMarker, 'userId'>[] } & Amity.Pagination>(
      cacheKey,
    ) ?? {};

  const users = data?.users.map(
    userId => pullFromCache<Amity.InternalUser>(['user', 'get', userId])?.data,
  );

  if (!users || users.some(user => !user)) return;

  const prevPage = toPage(data?.paging.previous);
  const nextPage = toPage(data?.paging.next);

  return { data: users as Amity.InternalUser[], cachedAt, prevPage, nextPage };
};
