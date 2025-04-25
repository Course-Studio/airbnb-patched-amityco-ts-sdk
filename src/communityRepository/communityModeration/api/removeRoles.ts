import { getActiveClient } from '~/client/api';

import { ingestInCache } from '~/cache/api/ingestInCache';
import { prepareCommunityMembershipPayload } from '~/communityRepository/utils';
import { fireEvent } from '~/core/events';

/* begin_public_function
  id: community.moderation.remove_roles
*/
/**
 * ```js
 * import { CommunityRepository } from '@amityco/ts-sdk'
 * const updated = await CommunityRepository.moderation.removeRoles(communityId, ['foo', 'bar'])
 * ```
 *
 * Removes a list of {@link Amity.Role} from a list of {@link Amity.InternalUser} on a {@link Amity.Community}
 *
 * @param communityId The ID of the {@link Amity.Community} to perform
 * @param roleIds Array of IDs of the {@link Amity.Role} to apply
 * @param userIds Array of IDs of the {@link Amity.InternalUser} to perform
 * @returns A success boolean if the {@link Amity.Role} were removed from list of {@link Amity.InternalUser} in the {@link Amity.Community}
 *
 * @category Community API
 * @async
 */
export const removeRoles = async (
  communityId: Amity.Community['communityId'],
  roleIds: Amity.Role['roleId'][],
  userIds: Amity.InternalUser['userId'][],
): Promise<boolean> => {
  const client = getActiveClient();
  client.log('community/moderation/removeRoles', communityId, roleIds, userIds);

  const { data: payload } = await client.http.delete<Amity.CommunityMembershipPayload>(
    `/api/v4/communities/${communityId}/users/roles`,
    { data: { communityId, roles: roleIds, userIds } },
  );

  const data = prepareCommunityMembershipPayload(payload);

  if (client.cache) ingestInCache(data);

  fireEvent('local.community.roleRemoved', data);

  const { communityUsers } = data;
  return !!communityUsers.find(
    communityUser =>
      communityUser.communityId === communityId &&
      !roleIds.some(role => communityUser.roles.includes(role)),
  );
};
/* end_public_function */
