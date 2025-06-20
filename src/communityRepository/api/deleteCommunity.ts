import { getActiveClient } from '~/client/api';

import { fireEvent } from '~/core/events';
import { getCommunity } from './getCommunity';

/* begin_public_function
  id: community.delete
*/
/**
 * ```js
 * import { deleteCommunity } from '@amityco/ts-sdk'
 * const success = await deleteCommunity('foobar')
 * ```
 *
 * Deletes a {@link Amity.Community}
 *
 * @param communityId The {@link Amity.Community} ID to delete
 * @return A success boolean if the {@link Amity.Community} was deleted
 *
 * @category Community API
 * @async
 */
export const deleteCommunity = async (
  communityId: Amity.Community['communityId'],
): Promise<Amity.Community> => {
  const client = getActiveClient();
  client.log('community/deleteCommunity', communityId);

  // API-FIX: This endpoint has not been implemented yet.
  await client.http.delete<{ success: boolean }>(`/api/v3/communities/${communityId}`);

  const deleted = await getCommunity(communityId);

  fireEvent('community.deleted', {
    communities: [deleted.data],
    categories: [],
    communityUsers: [],
    feeds: [],
    files: [],
    users: [],
  });

  return deleted.data;
};
/* end_public_function */
