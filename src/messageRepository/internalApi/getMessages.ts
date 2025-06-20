import { getActiveClient } from '~/client/api';

import { fireEvent } from '~/core/events';
import { pullFromCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';

import { prepareMessagePayload } from '../utils';

/**
 * ```js
 * import { getMessages } from '@amityco/ts-sdk'
 * const messages = await getMessages(['foo', 'bar'])
 * ```
 *
 * Fetches a collection of {@link Amity.Message} objects
 *
 * @param messageIds the IDs of the {@link Amity.Message} to fetch
 * @returns the associated collection of {@link Amity.Message} objects
 *
 * @category Message API
 * @async
 */
export const getMessages = async (
  messageIds: Amity.Message['messageId'][],
): Promise<Amity.Cached<Amity.InternalMessage[]>> => {
  const client = getActiveClient();
  client.log('message/getMessages', messageIds);

  const { data: payload } = await client.http.get<Amity.MessagePayload>(`/api/v5/messages/list`, {
    params: { messageIds: messageIds.map(encodeURIComponent) },
  });

  const data = await prepareMessagePayload(payload);

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(data, { cachedAt });

  const { messages } = data;

  fireEvent('local.message.fetched', { messages });

  return {
    data: messages,
    cachedAt,
  };
};

/**
 * ```js
 * import { getMessages } from '@amityco/ts-sdk'
 * const messages = getMessages.locally(['foo', 'bar']) ?? []
 * ```
 *
 * Fetches a collection of {@link Amity.Message} objects from cache
 *
 * @param messageIds the IDs of the {@link Amity.Message} to fetch
 * @returns the associated collection of {@link Amity.Message} objects
 *
 * @category Message API
 */
getMessages.locally = (
  messageIds: Amity.Message['messageId'][],
): Amity.Cached<Amity.InternalMessage[]> | undefined => {
  const client = getActiveClient();
  client.log('message/getMessages.locally', messageIds);

  if (!client.cache) return;

  const cached = messageIds
    .map(messageId => pullFromCache<Amity.InternalMessage>(['message', 'get', messageId])!)
    .filter(Boolean);

  const messages = cached.map(({ data }) => data);
  const oldest = cached.sort((a, b) => (a.cachedAt! < b.cachedAt! ? -1 : 1))?.[0];

  if (cached?.length < messageIds.length) return;

  return {
    data: messages,
    cachedAt: oldest.cachedAt,
  };
};
