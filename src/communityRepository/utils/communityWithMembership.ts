import { pullFromCache } from '~/cache/api';
import { getActiveUser } from '~/client';

/*
 * verifies membership status
 */
function isMember(membership: Amity.Membership<'community'>['communityMembership']): boolean {
  return membership !== 'none';
}

/*
 * checks if currently logged in user is part of the community
 */
function isCurrentUserPartOfCommunity(
  c: Amity.Community,
  m: Amity.Membership<'community'>,
): boolean {
  const { userId } = getActiveUser();

  return c.communityId === m.communityId && m.userId === userId;
}

/*
 * For mqtt events server will not send user specific data as it's broadcasted
 * to multiple users and it also does not include communityUser
 *
 * Client SDK needs to check for the existing isJoined field in cache data before calculating.
 * Althought this can be calculated, it's not scalable.
 */
export function updateMembershipStatus(
  communities: Amity.Community[],
  communityUsers: Amity.Membership<'community'>[],
): Amity.Community[] {
  return communities.map(c => {
    const cachedCommunity = pullFromCache<Amity.Community>(['community', 'get', c.communityId]);
    if (cachedCommunity?.data && cachedCommunity?.data.hasOwnProperty('isJoined')) {
      return {
        ...cachedCommunity.data,
        ...c,
      };
    }

    const isJoined = communityUsers.some(
      m => isCurrentUserPartOfCommunity(c, m) && isMember(m.communityMembership),
    );
    return { ...c, isJoined };
  });
}
