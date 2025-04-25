import { getActiveClient } from '~/client/api';

import { fireEvent } from '~/core/events';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { prepareMembershipPayload } from '~/group/utils';

/* begin_public_function
  id: community.membership.add_members
*/
/**
 * ```js
 * import { CommunityRepository } from '@amityco/ts-sdk'
 * const updated = await CommunityRepository.moderation.addMembers(communityId, ['foo', 'bar'])
 * ```
 *
 * Adds a list of {@link Amity.InternalUser} to a {@link Amity.Community} to add users to
 *
 * @param communityId The ID of the {@link Amity.Community} to perform
 * @param userIds The list of IDs {@link Amity.InternalUser} to add
 * @returns A success boolean if the {@link Amity.InternalUser} were added to the {@link Amity.Community}
 *
 * @category Community API
 * @async
 */
export const addMembers = async (
  communityId: Amity.Community['communityId'],
  userIds: Amity.InternalUser['userId'][],
): Promise<boolean> => {
  const client = getActiveClient();
  client.log('community/moderation/addMembers', communityId, userIds);

  const { data: payload } = await client.http.post<Amity.CommunityMembershipPayload>(
    `/api/v3/communities/${communityId}/users`,
    { communityId, userIds },
  );

  fireEvent('local.community.userAdded', payload);

  const data = prepareMembershipPayload(payload, 'communityUsers');

  if (client.cache) ingestInCache(data);

  const { communityUsers } = data;
  return !!communityUsers.find(
    communityUser =>
      communityUser.communityId === communityId && communityUser.communityMembership === 'member',
  );
};
/* end_public_function */
