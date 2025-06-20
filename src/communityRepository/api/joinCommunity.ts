import { getActiveClient } from '~/client/api';

import { ingestInCache } from '~/cache/api/ingestInCache';
import { prepareCommunityPayload } from '~/communityRepository/utils';
import { fireEvent } from '~/core/events';

/* begin_public_function
  id: community.join
*/
/**
 * ```js
 * import { joinCommunity } from '@amityco/ts-sdk'
 * const isJoined = await joinCommunity('foobar')
 * ```
 *
 * Joins a {@link Amity.Community} object
 *
 * @param communityId the {@link Amity.Community} to join
 * @returns A success boolean if the {@link Amity.Community} was joined
 *
 * @category Community API
 * @async
 */
export const joinCommunity = async (
  communityId: Amity.Community['communityId'],
): Promise<boolean> => {
  const client = getActiveClient();
  client.log('community/joinCommunity', communityId);

  const { data: payload } = await client.http.post<Amity.CommunityMembershipPayload>(
    `/api/v3/communities/${communityId}/join`,
  );

  fireEvent('local.community.joined', payload);

  const data = prepareCommunityPayload(payload);

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(data, { cachedAt });

  const { communityUsers } = data;

  return !!communityUsers.find(
    communityUser =>
      communityUser.communityId === communityId && communityUser.communityMembership === 'member',
  );
};
/* end_public_function */
