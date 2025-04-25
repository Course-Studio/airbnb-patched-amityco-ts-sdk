import { getActiveClient } from '~/client/api';

import { ingestInCache } from '~/cache/api/ingestInCache';

import { prepareChannelPayload } from '../utils';
import { constructChannelDynamicValue } from '../utils/constructChannelDynamicValue';

/* begin_public_function
  id: channel.create
*/
/**
 * ```js
 * import { createChannel } from '@amityco/ts-sdk'
 * const created = await createChannel({ displayName: 'foobar' })
 * ```
 *
 * Creates an {@link Amity.Channel}
 *
 * @param bundle The data necessary to create a new {@link Amity.Channel}
 * @returns The newly created {@link Amity.Channel}
 *
 * @category Channel API
 * @async
 */
export const createChannel = async <T extends Amity.ChannelType>(
  bundle: { type: T; userIds?: Amity.InternalUser['userId'][] } & Pick<
    Amity.Channel<T>,
    'displayName' | 'avatarFileId' | 'tags' | 'metadata' | 'isPublic'
  >,
): Promise<Amity.Cached<Amity.InternalChannel>> => {
  const client = getActiveClient();
  client.log('user/createChannel', bundle);

  let payload;

  if (bundle?.type === 'conversation') {
    payload = await client.http.post<Amity.ChannelPayload>('/api/v3/channels/conversation', {
      ...bundle,
      isDistinct: true,
    });
  } else {
    const { isPublic, ...restParams } = bundle;

    payload = await client.http.post<Amity.ChannelPayload>('/api/v3/channels', {
      ...restParams,
      isPublic: bundle?.type === 'community' ? isPublic : undefined,
    });
  }
  const data = await prepareChannelPayload(payload.data);

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(data, { cachedAt });

  const { channels } = data;
  return {
    data: constructChannelDynamicValue(channels[0]),
    cachedAt,
  };
};
/* end_public_function */
