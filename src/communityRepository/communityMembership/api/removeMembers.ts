import { getActiveClient } from '~/client/api';

import { ingestInCache } from '~/cache/api/ingestInCache';
import { fireEvent } from '~/core/events';
import { prepareMembershipPayload } from '~/group/utils';

/* begin_public_function
  id: community.membership.remove_member
*/
/**
 * ```js
 * import { CommunityRepository } from '@amityco/ts-sdk'
 * const updated = await CommunityRepository.moderation.removeMembers(communityId, ['foo', 'bar'])
 * ```
 *
 * Removes a list of {@link Amity.InternalUser} from a {@link Amity.Community}
 *
 * @param communityId The ID of the {@link Amity.Community} to edit
 * @param userIds The list of IDs {@link Amity.InternalUser} to remove
 * @returns A success boolean if the list of {@link Amity.InternalUser} were removed from the {@link Amity.Community}
 *
 * @category Community API
 * @async
 */
export const removeMembers = async (
  communityId: Amity.Community['communityId'],
  userIds: Amity.InternalUser['userId'][],
): Promise<boolean> => {
  const client = getActiveClient();
  client.log('community/moderation/removeMembers', communityId, userIds);

  const { data: payload } = await client.http.delete<Amity.CommunityMembershipPayload>(
    `/api/v3/communities/${communityId}/users`,
    { data: { communityId, userIds } },
  );

  fireEvent('local.community.userRemoved', payload);

  const data = prepareMembershipPayload(payload, 'communityUsers');

  if (client.cache) ingestInCache(data);

  const { communityUsers } = data;

  return !!communityUsers.find(
    communityUser =>
      communityUser.communityId === communityId && communityUser.communityMembership !== 'member',
  );
};
/* end_public_function */
