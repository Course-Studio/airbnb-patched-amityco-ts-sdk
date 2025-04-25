import { getActiveClient } from '~/client/api';

import { fireEvent } from '~/core/events';
import { toPageRaw } from '~/core/query';
import { pushToCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { getResolver } from '~/core/model';
import { convertQueryParams, prepareMessagePayload } from '../utils';
import { LinkedObject } from '~/utils/linkedObject';

/**
 * ```js
 * import { queryMessages } from '@amityco/ts-sdk'
 * const messages = await queryMessages({ channelId })
 * ```
 *
 * Queries a paginable list of {@link Amity.Message} objects
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.Message} objects
 *
 * @category Message API
 * @async
 */
export const queryMessages = async (
  query: Amity.QueryMessages,
): Promise<Amity.Cached<Amity.Paged<Amity.Message, Amity.Page<string>> & Amity.Pagination>> => {
  const client = getActiveClient();
  client.log('message/queryMessages', query);

  const { pageToken, ...params } = convertQueryParams(query);

  // API-FIX: parameters should be querystring. (1)
  // API-FIX: backend should answer Amity.Response (2)
  // API-FIX: pagination should not be indexed on channelSegment (3)
  // const { data } = await client.http.get<Amity.Response<Amity.Paged<Amity.MessagePayload>>>(
  const { data: queryPayload } = await client.http.get<Amity.MessagePayload & Amity.Pagination>(
    `/api/v5/messages`,
    {
      params: {
        ...params,
        ...(pageToken
          ? {
              options: { token: pageToken },
            }
          : {}),
      },
    },
  );

  // API-FIX: backend should answer Amity.Response (2)
  // const { paging, messages } = unwrapPayload(data)
  const { paging, ...payload } = queryPayload;
  const data = await prepareMessagePayload(payload);
  const { messages } = data;

  const cachedAt = client.cache && Date.now();

  if (client.cache) {
    /*
     * queryMessages.locally is unsupported for messages as message list updates
     * frequently and leads to bugs when user switches between channels, i.e. when
     * the public function (live messages) calls unmount. The list fetched on
     * after from the cache is stale.
     */
    ingestInCache(data, { cachedAt });

    const cacheKey = ['message', 'query', { ...params } as Amity.Serializable];
    pushToCache(cacheKey, { messages: messages.map(getResolver('message')), paging });
  }

  fireEvent('local.message.fetched', { messages });

  const nextPage = toPageRaw(paging.next);
  const prevPage = toPageRaw(paging.previous);

  return {
    data: messages.map(message => LinkedObject.message(message)),
    cachedAt,
    prevPage,
    nextPage,
    paging,
  };
};
/* end_public_function */
