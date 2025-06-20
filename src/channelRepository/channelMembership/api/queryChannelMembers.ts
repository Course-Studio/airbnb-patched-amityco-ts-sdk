import { prepareChannelPayload } from '~/channelRepository/utils';
import { getActiveClient } from '~/client/api';

import { toPage, toToken } from '~/core/query';
import { getResolver } from '~/core/model';

import { pullFromCache, pushToCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';

/**
 * ```js
 * import { queryChannelMembers } from '@amityco/ts-sdk'
 * const channelMembers = await queryChannelMembers({ channelId: 'foo' })
 * ```
 *
 * Queries a paginable list of {@link Amity.ChannelUser} objects
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.ChannelUser} objects
 *
 * @category Channel API
 * @async
 * */
export const queryChannelMembers = async (
  query: Amity.QueryChannelMembers,
): Promise<Amity.Cached<Amity.Paged<Amity.Membership<'channel'>>>> => {
  const client = getActiveClient();
  client.log('channel/queryChannelMembers', query);

  const { page, ...params } = query ?? {};

  const { data: queryPayload } = await client.http.get<
    Amity.ChannelMembershipPayload & Amity.Pagination
  >(`/api/v4/channels/${encodeURIComponent(params.channelId)}/users`, {
    params: {
      ...params,
      options: {
        token: toToken(page, 'skiplimit'),
      },
    },
  });

  const { paging, ...payload } = queryPayload;
  const preparedPayload = await prepareChannelPayload(payload);
  const { channelUsers } = preparedPayload;

  const cachedAt = client.cache && Date.now();

  if (client.cache) {
    ingestInCache(preparedPayload);

    const cacheKey = [
      'channelUsers',
      'query',
      { ...params, options: { ...page } } as Amity.Serializable,
    ];

    pushToCache(cacheKey, {
      channelUsers: channelUsers.map(({ channelId, userId }) =>
        getResolver('channelUsers')({ channelId, userId }),
      ),
      paging,
    });
  }

  const nextPage = toPage(paging.next);
  const prevPage = toPage(paging.previous);

  return {
    data: channelUsers,
    cachedAt,
    nextPage,
    prevPage,
  };
};

/**
 * ```js
 * import { queryChannelMembers } from '@amityco/ts-sdk'
 * const channelMembers = await queryChannelMembers(query)
 * ```
 *
 * Queries a paginable list of {@link Amity.InternalPost} objects from cache
 *
 * @param query The query parameters
 * @returns posts
 *
 * @category Post API
 */
queryChannelMembers.locally = (
  query: Parameters<typeof queryChannelMembers>[0],
): Amity.Cached<Amity.Paged<Amity.Membership<'channel'>>> | undefined => {
  const client = getActiveClient();
  client.log('channel/queryChannelMembers.locally', query);

  if (!client.cache) return;

  const { page, ...params } = query;

  const cacheKey = [
    'channelUsers',
    'query',
    { ...params, options: { ...page } } as Amity.Serializable,
  ];

  const { data, cachedAt } =
    pullFromCache<
      {
        channelUsers: Pick<Amity.Membership<'channel'>, 'channelId' | 'userId'>[];
      } & Amity.Pagination
    >(cacheKey) ?? {};

  if (!data?.channelUsers.length) return;

  const channelUsers: Amity.Membership<'channel'>[] = data.channelUsers
    // ck -> cacheKey, abbrevated to avoid confusion from the above cache key
    .map(ck => pullFromCache<Amity.Membership<'channel'>>(['channelUsers', 'get', ck])!)
    .filter(Boolean)
    .map(({ data }) => data);

  const prevPage = toPage(data?.paging.previous);
  const nextPage = toPage(data?.paging.next);

  return channelUsers.length === data?.channelUsers?.length
    ? { data: channelUsers, cachedAt, prevPage, nextPage }
    : undefined;
};
