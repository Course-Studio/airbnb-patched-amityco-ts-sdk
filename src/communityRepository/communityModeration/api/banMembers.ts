import { getActiveClient } from '~/client/api/activeClient';

import { ingestInCache } from '~/cache/api/ingestInCache';

import { prepareMembershipPayload } from '~/group/utils';

/* begin_public_function
  id: community.moderation.ban_members
*/
/**
 * ```js
 * import { CommunityRepository } from '@amityco/ts-sdk'
 *
 * await CommunityRepository.Moderation.banMembers('communityId', ['userId1', 'userId2'])
 * ```
 *
 * @param communityId of {@link Amity.Community} from which the users should be banned
 * @param userIds of the {@link Amity.InternalUser}'s to be banned
 * @returns the updated {@link Amity.Membership}'s object
 *
 * @category Community API
 * @async
 * */
export const banMembers = async (
  communityId: Amity.Community['communityId'],
  userIds: Amity.InternalUser['userId'][],
): Promise<Amity.Cached<Amity.Membership<'community'>[]>> => {
  const client = getActiveClient();
  client.log('community/banMembers', { userIds, communityId });

  const { data: payload } = await client.http.put<Amity.CommunityMembershipPayload>(
    `/api/v3/communities/${communityId}/users/ban`,
    {
      userIds,
    },
  );

  const data = prepareMembershipPayload(payload, 'communityUsers');

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(data, { cachedAt });

  const { communityUsers } = data;

  return {
    data: communityUsers.filter(u => userIds.includes(u.userId)),
    cachedAt,
  };
};
/* end_public_function */
