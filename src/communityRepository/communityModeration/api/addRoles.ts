import { getActiveClient } from '~/client/api';

import { ingestInCache } from '~/cache/api/ingestInCache';
import { fireEvent } from '~/core/events';
import { prepareCommunityMembershipPayload } from '~/communityRepository/utils';

/* begin_public_function
  id: community.moderation.add_roles
*/
/**
 * ```js
 * import { CommunityRepository } from '@amityco/ts-sdk'
 * const updated = await CommunityRepository.moderation.addRoles(communityId, ['foo', 'bar'])
 * ```
 *
 * Adds a list of {@link Amity.Role} to a list of {@link Amity.InternalUser} on a {@link Amity.Community}
 *
 * @param communityId The ID of the {@link Amity.Community} to perform
 * @param roleIds Array of IDs of the {@link Amity.Role} to apply
 * @param userIds Array of IDs of the {@link Amity.InternalUser} to perform
 * @returns A success boolean if the {@link Amity.Role} were added to list of {@link Amity.InternalUser} in the {@link Amity.Community}
 *
 * @category Community API
 * @async
 */
export const addRoles = async (
  communityId: Amity.Community['communityId'],
  roleIds: Amity.Role['roleId'][],
  userIds: Amity.InternalUser['userId'][],
): Promise<boolean> => {
  const client = getActiveClient();
  client.log('community/moderation/addRoles', communityId, roleIds, userIds);

  const { data: payload } = await client.http.post<Amity.CommunityMembershipPayload>(
    `/api/v4/communities/${communityId}/users/roles`,
    { communityId, roles: roleIds, userIds },
  );

  const data = prepareCommunityMembershipPayload(payload);

  if (client.cache) ingestInCache(data);

  fireEvent('local.community.roleAdded', data);

  const { communityUsers } = data;
  return !!communityUsers.find(
    communityUser =>
      communityUser.communityId === communityId &&
      roleIds.some(role => communityUser.roles.includes(role)),
  );
};
/* end_public_function */
