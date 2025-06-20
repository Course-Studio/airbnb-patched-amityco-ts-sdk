import { getActiveClient } from '~/client/api';

import { getChannel } from '../internalApi/getChannel';
import { constructChannelDynamicValue } from '../utils/constructChannelDynamicValue';

/**
 * ```js
 * import { deleteChannel } from '@amityco/ts-sdk'
 * const success = await deleteChannel('foobar')
 * ```
 *
 * Deletes a {@link Amity.Channel}
 *
 * @param channelId The {@link Amity.Channel} ID to delete
 * @return A success boolean if the {@link Amity.Channel} was deleted
 *
 * @category Channel API
 * @async
 */
export const deleteChannel = async (
  channelId: Amity.Channel['channelId'],
): Promise<Amity.InternalChannel> => {
  const client = getActiveClient();
  client.log('channel/deleteChannel', channelId);

  await client.http.delete<{ success: boolean }>(
    `/api/v3/channels/${encodeURIComponent(channelId)}`,
  );

  const deleted = await getChannel(channelId);
  // no need for event, fired by server

  return constructChannelDynamicValue(deleted.data);
};
