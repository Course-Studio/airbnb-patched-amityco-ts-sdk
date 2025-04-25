import { getActiveClient } from '~/client/api';
import { deleteSubChannel } from './deleteSubChannel';

/* begin_public_function
  id: subchannel.soft_delete
*/
/**
 * ```js
 * import { SubChannelRepository } from '@amityco/ts-sdk'
 * const success = await SubChannelRepository.softDeleteSubChannel('foobar')
 * ```
 *
 * Deletes a {@link Amity.SubChannel}
 *
 * @param subChannelId The {@link Amity.SubChannel} ID to soft delete
 * @return A success boolean if the {@link Amity.SubChannel} was soft deleted
 *
 * @category Channel API
 * @async
 */
export const softDeleteSubChannel = async (
  subChannelId: Amity.SubChannel['subChannelId'],
): Promise<Amity.SubChannel> => {
  const client = getActiveClient();
  client.log('channel/softDeleteSubChannel', subChannelId);

  const softDelted = await deleteSubChannel(subChannelId, false);

  return softDelted;
};
/* end_public_function */
