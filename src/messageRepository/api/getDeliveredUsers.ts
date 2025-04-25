import { ingestInCache } from '~/cache/api/ingestInCache';
import { getActiveClient } from '~/client/api';
import { toPage, toToken } from '~/core/query';
import { pullFromCache, pushToCache } from '~/cache/api';
import { getUserByIds } from '~/userRepository';
import { convertSubChannelMarkerResponse } from '~/utils/marker';

/**
 * ```js
 * import { getDeliveredUsers } from '@amityco/ts-sdk'
 * const { data: users, prevPage, nextPage } = await getDeliveredUsers({
 *   messageId: 'foo',
 * })
 * ```
 *
 * Queries a paginable list of delivered {@link Amity.InternalUser} by messageId
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.InternalUser} objects
 *
 * @category Message API
 * @async
 */
export const getDeliveredUsers = async (
  query: Amity.QueryDeliveredUsers,
): Promise<Amity.Cached<Amity.Paged<Amity.InternalUser>>> => {
  const client = getActiveClient();
  client.log('user/getDeliveredUsers', query);

  const { page, messageId, ...params } = query;

  const { data } = await client.http.get<Amity.DeliveredUserPayload & Amity.Pagination>(
    `/api/v1/markers/messages/${messageId}/delivered-users`,
    {
      params: {
        ...params,
        options: {
          token: toToken(page, 'afterbeforeraw'),
        },
      },
    },
  );

  const { paging, publicUserIds: deliveredUsers, userFeedMarkers, ...payload } = data;
  const cachedAt = client.cache && Date.now();

  if (client.cache) {
    ingestInCache(
      {
        ...payload,
        userFeedMarkers: convertSubChannelMarkerResponse(userFeedMarkers),
      },
      { cachedAt },
    );

    const cacheKey = [
      'delivered-user',
      'query',
      { messageId, ...params, options: { ...page } } as Amity.Serializable,
    ];

    pushToCache(cacheKey, { users: deliveredUsers, paging });
  }

  let users: Amity.InternalUser[] = [];

  if (deliveredUsers.length > 0) {
    ({ data: users } = await getUserByIds(deliveredUsers));
  }

  const prevPage = toPage(paging.previous);
  const nextPage = toPage(paging.next);

  return { data: users, cachedAt, prevPage, nextPage };
};

/**
 * ```js
 * import { getDeliveredUsers } from '@amityco/ts-sdk'
 * const { data: users } = getDeliveredUsers.locally({
 *   messageId: 'foo',
 * })
 * ```
 *
 * Queries a paginable list of delivered {@link Amity.InternalUser} objects from cache
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.InternalUser} objects
 *
 * @category Message API
 */
getDeliveredUsers.locally = (
  query: Amity.QueryDeliveredUsers,
): Amity.Cached<Amity.Paged<Amity.InternalUser>> | undefined => {
  const client = getActiveClient();
  client.log('user/getDeliveredUsers.locally', query);

  if (!client.cache) return;

  const { page, ...params } = query;

  const cacheKey = [
    'delivered-user',
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
