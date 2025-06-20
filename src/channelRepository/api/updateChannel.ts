import { getActiveClient } from '~/client/api';

import { ingestInCache } from '~/cache/api/ingestInCache';

import { prepareChannelPayload } from '../utils';
import { constructChannelDynamicValue } from '../utils/constructChannelDynamicValue';

/* begin_public_function
  id: channel.update
*/
/**
 * ```js
 * import { updateChannel } from '@amityco/ts-sdk'
 * const updated = await updateChannel(channelId, { displayName: 'foobar' })
 * ```
 *
 * Updates an {@link Amity.Channel}
 *
 * @param channelId The ID of the {@link Amity.Channel} to edit
 * @param patch The patch data to apply
 * @returns the updated {@link Amity.Channel} object
 *
 * @category Channel API
 * @async
 */
export const updateChannel = async (
  channelId: Amity.Channel['channelId'],
  patch: Patch<Amity.Channel, 'displayName' | 'avatarFileId' | 'tags' | 'metadata'>,
): Promise<Amity.Cached<Amity.InternalChannel>> => {
  const client = getActiveClient();
  client.log('channel/updateChannel', channelId, patch);

  const { data: payload } = await client.http.put<Amity.ChannelPayload>(
    `/api/v3/channels/${encodeURIComponent(channelId)}`,
    patch,
  );

  const data = await prepareChannelPayload(payload);

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(data, { cachedAt });

  const { channels } = data;

  return {
    data: constructChannelDynamicValue(channels.find(channel => channel.channelId === channelId)!),
    cachedAt,
  };
};
/* end_public_function */
