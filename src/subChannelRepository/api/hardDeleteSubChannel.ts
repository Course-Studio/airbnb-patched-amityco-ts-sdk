import { getActiveClient } from '~/client/api';
import { deleteSubChannel } from './deleteSubChannel';

/* begin_public_function
  id: subchannel.hard_delete
*/
/**
 * ```js
 * import { SubChannelRepository } from '@amityco/ts-sdk'
 * const success = await SubChannelRepository.hardDeleteSubChannel('foobar')
 * ```
 *
 * Deletes a {@link Amity.SubChannel}
 *
 * @param subChannelId The {@link Amity.SubChannel} ID to hard delete
 * @return The {@link Amity.SubChannel} was hard deleted
 *
 * @category Channel API
 * @async
 */
export const hardDeleteSubChannel = async (
  subChannelId: Amity.SubChannel['subChannelId'],
): Promise<Amity.SubChannel> => {
  const client = getActiveClient();
  client.log('channel/hardDeleteSubChannel', subChannelId);

  const hardDeleted = await deleteSubChannel(subChannelId, true);

  return hardDeleted;
};
/* end_public_function */
