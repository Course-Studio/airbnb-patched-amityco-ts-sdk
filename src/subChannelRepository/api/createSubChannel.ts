import { getActiveClient } from '~/client/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { fireEvent } from '~/core/events';
import { prepareSubChannelPayload } from '../utils';

/* begin_public_function
  id: subchannel.create
*/
/**
 * ```js
 * import { createSubChannel } from '@amityco/ts-sdk'
 * const created = await createSubChannel({ channelId: 'foobar', name: 'foobar' })
 * ```
 *
 * Creates an {@link Amity.SubChannel}
 *
 * @param bundle The data necessary to create a new {@link Amity.SubChannel}
 * @returns The newly created {@link Amity.SubChannel}
 *
 * @category Channel API
 * @async
 */
export const createSubChannel = async <T extends Amity.ChannelType>(
  bundle: Pick<Amity.SubChannel, 'channelId' | 'displayName'>,
): Promise<Amity.Cached<Amity.SubChannel>> => {
  const client = getActiveClient();
  client.log('user/createSubChannel', bundle);

  const response = await client.http.post<Amity.SubChannelPayload>('/api/v5/message-feeds', {
    channelId: bundle.channelId,
    name: bundle.displayName,
  });
  const data = await prepareSubChannelPayload(response.data);

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(data, { cachedAt });

  fireEvent('message-feed.created', response.data);

  return {
    data: data.messageFeeds[0],
    cachedAt,
  };
};
/* end_public_function */
