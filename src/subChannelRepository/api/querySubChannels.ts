import { pushToCache, pullFromCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { getActiveClient } from '~/client/api';
import { getResolver } from '~/core/model';
import { toPage, toToken } from '~/core/query';
import { fireEvent } from '~/core/events';

import { inferIsDeleted } from '~/utils/inferIsDeleted';
import { convertQueryParams, prepareSubChannelPayload } from '../utils';

/**
 * ```js
 * import { querySubChannels } from '@amityco/ts-sdk'
 * const subChannels = await querySubChannels({ channelId: 'channelId' })
 * ```
 *
 * Queries a paginable list of {@link Amity.SubChannel} objects
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.SubChannel} objects
 *
 * @category Channel API
 * @async
 */
export const querySubChannels = async (
  query: Amity.QuerySubChannels,
): Promise<Amity.Cached<Amity.Paged<Amity.SubChannel>> & Amity.Pagination> => {
  const client = getActiveClient();
  client.log('channel/querySubChannels', query);

  const {
    page = { limit: 10 },
    channelId,
    includeDeleted,
    pageToken,
    ...params
  } = convertQueryParams(query);

  const response = await client.http.get<Amity.SubChannelPayload & Amity.Pagination>(
    `/api/v5/message-feeds/channel/${channelId}`,
    {
      params: {
        ...params,
        isDeleted: inferIsDeleted(includeDeleted),
        options: {
          token: pageToken || toToken(page, 'afterbefore'),
        },
      },
    },
  );

  const { paging, ...payload } = response.data;
  const data = await prepareSubChannelPayload(payload);
  const subChannels = data.messageFeeds;
  const cachedAt = client.cache && Date.now();

  if (client.cache) {
    ingestInCache(data as Amity.ProcessedSubChannelPayload, { cachedAt });

    const cacheKey = [
      'subChannel',
      'query',
      { channelId, ...params, options: { ...page } } as Amity.Serializable,
    ];
    pushToCache(cacheKey, { subChannels: subChannels.map(getResolver('subChannel')), paging });
  }

  fireEvent('local.message-feed.fetched', data);

  const nextPage = toPage(paging.next);
  const prevPage = toPage(paging.previous);

  return {
    data: subChannels,
    cachedAt,
    prevPage,
    nextPage,
    paging,
  };
};
/* end_public_function */

/**
 * ```js
 * import { querySubChannels } from '@amityco/ts-sdk'
 * const subChannels = querySubChannels.locally({ channelId: 'channelId' })
 * ```
 *
 * Queries a paginable list of {@link Amity.SubChannel} objects from cache
 *
 * @param query The query parameters
 * @returns sub channels
 *
 * @category Channel API
 */
querySubChannels.locally = (
  query: Parameters<typeof querySubChannels>[0],
): Amity.Cached<Amity.Paged<Amity.SubChannel> & Amity.Pagination> | undefined => {
  const client = getActiveClient();
  client.log('channel/querySubChannels.locally', query);

  // @ts-ignore
  const { page = { limit: 10 }, channelId, ...params } = convertQueryParams(query) ?? {};

  const cacheKey = [
    'subChannel',
    'query',
    { channelId, ...params, options: { ...page } } as Amity.Serializable,
  ];

  const { data, cachedAt } =
    pullFromCache<
      {
        subChannels: Pick<Amity.SubChannel, 'subChannelId'>[];
      } & Amity.Pagination
    >(cacheKey) ?? {};

  if (!data?.subChannels.length) return;

  const subChannels: Amity.SubChannel[] = data.subChannels
    .map(ck => pullFromCache<Amity.SubChannel>(['subChannel', 'get', ck])!)
    .filter(Boolean)
    .map(({ data }) => data);

  const prevPage = toPage(data?.paging.previous);
  const nextPage = toPage(data?.paging.next);

  return subChannels.length === data?.subChannels?.length
    ? { data: subChannels, cachedAt, prevPage, nextPage, paging: data?.paging }
    : undefined;
};
