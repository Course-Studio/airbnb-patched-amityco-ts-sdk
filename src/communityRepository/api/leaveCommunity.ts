import { getActiveClient } from '~/client/api';

import { ingestInCache } from '~/cache/api/ingestInCache';
import { prepareCommunityPayload } from '~/communityRepository/utils';
import { fireEvent } from '~/core/events';

/* begin_public_function
  id: community.leave
*/
/**
 * ```js
 * import { leaveCommunity } from '@amityco/ts-sdk'
 * const isLeft = await leaveCommunity('foobar')
 * ```
 *
 * Leaves a {@link Amity.Community} object
 *
 * @param communityId the {@link Amity.Community} to leave
 * @returns A success boolean if {@link Amity.Community} was left
 *
 * @category Community API
 * @async
 */
export const leaveCommunity = async (
  communityId: Amity.Community['communityId'],
): Promise<boolean> => {
  const client = getActiveClient();
  client.log('community/leaveCommunity', communityId);

  const { data: payload } = await client.http.delete<Amity.CommunityMembershipPayload>(
    `/api/v3/communities/${communityId}/leave`,
  );

  fireEvent('local.community.left', payload);

  const data = prepareCommunityPayload(payload);

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(data, { cachedAt });

  const { communityUsers } = data;

  return !!communityUsers.find(
    communityUser =>
      communityUser.communityId === communityId && communityUser.communityMembership !== 'member',
  );
};
/* end_public_function */
