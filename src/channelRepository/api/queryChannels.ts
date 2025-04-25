import { getActiveClient } from '~/client/api';
import { getResolver } from '~/core/model';

import { pushToCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';

import { prepareChannelPayload } from '../utils';

/**
 * ```js
 * import { queryChannels } from '@amityco/ts-sdk'
 * const channels = await queryChannels()
 * ```
 *
 * Queries a paginable list of {@link Amity.Channel} objects
 * Search is performed by displayName such as `.startsWith(search)`
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.Channel} objects
 *
 * @category Channel API
 * @async
 */
export const queryChannels = async (
  query?: Amity.QueryChannels,
): Promise<Amity.Cached<Amity.PageToken<Amity.InternalChannel>>> => {
  const client = getActiveClient();
  client.log('channel/queryChannels', query);

  // safe decapsulation
  const { page = undefined, limit = 10, displayName, membership, ...params } = query ?? {};

  // API-FIX: parameters should be querystring.
  // API-FIX: backend doesn't answer Amity.Response
  // const { data } = await client.http.get<Amity.Response<Amity.Paged<ChannelPayload>>>(
  const { data: queryPayload } = await client.http.get<Amity.ChannelPayload & Amity.Pagination>(
    `/api/v3/channels`,
    {
      params: {
        ...params,
        keyword: displayName,
        filter: membership,
        options: page ? { token: page } : { limit },
      },
    },
  );

  const { paging, ...payload } = queryPayload;

  const data = await prepareChannelPayload(payload);

  const { channels } = data;

  const cachedAt = client.cache && Date.now();

  if (client.cache) {
    ingestInCache(data, { cachedAt });

    const cacheKey = ['channel', 'query', { ...params, options: { limit } } as Amity.Serializable];
    pushToCache(cacheKey, { channels: channels.map(getResolver('channel')), paging });
  }

  return { data: channels, cachedAt, paging };
};
