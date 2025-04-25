import { getActiveClient } from '~/client/api';

import { fireEvent } from '~/core/events';
import { pullFromCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';

import { isInTombstone } from '~/cache/api/isInTombstone';
import { checkIfShouldGoesToTombstone } from '~/cache/utils';
import { pushToTombstone } from '~/cache/api/pushToTombstone';

import { prepareMessagePayload } from '../utils';

/**
 * ```js
 * import { getMessage } from '@amityco/ts-sdk'
 * const message = await getMessage('foobar')
 * ```
 *
 * Fetches a {@link Amity.InternalMessage} object
 *
 * @param messageId the ID of the {@link Amity.Message} to fetch
 * @returns the associated {@link Amity.Message} object
 *
 * @category Message API
 * @async
 */
export const getMessage = async (
  messageId: Amity.Message['messageId'],
  isLive = false,
): Promise<Amity.Cached<Amity.InternalMessage>> => {
  const client = getActiveClient();
  client.log('message/getMessage', messageId);

  isInTombstone('message', messageId);

  let data: Amity.ProcessedMessagePayload;

  try {
    // API-FIX: endpoint should not be /list, parameters should be querystring.
    const { data: payload } = await client.http.get<Amity.MessagePayload>(
      `/api/v5/messages/${encodeURIComponent(messageId)}`,
    );

    data = await prepareMessagePayload(payload);
  } catch (error) {
    if (checkIfShouldGoesToTombstone((error as Amity.ErrorResponse)?.code)) {
      pushToTombstone('message', messageId);
    }

    throw error;
  }

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(data, { cachedAt });

  const { messages } = data;

  fireEvent('local.message.fetched', { messages });

  return {
    data: messages.find(message => message.messageId === messageId)!,
    cachedAt,
  };
};

/**
 * ```js
 * import { getMessage } from '@amityco/ts-sdk'
 * const message = getMessage.locally('foobar')
 * ```
 *
 * Fetches a {@link Amity.Message} object
 *
 * @param messageId the ID of the {@link Amity.Message} to fetch
 * @returns the associated {@link Amity.Message} object
 *
 * @category Message API
 */
getMessage.locally = (
  messageId: Amity.Message['messageId'],
): Amity.Cached<Amity.InternalMessage> | undefined => {
  const client = getActiveClient();
  client.log('message/getMessage.locally', messageId);

  if (!client.cache) return;

  const cached = pullFromCache<Amity.InternalMessage>(['message', 'get', messageId]);

  if (!cached) return;

  return {
    data: cached.data,
    cachedAt: cached.cachedAt,
  };
};
