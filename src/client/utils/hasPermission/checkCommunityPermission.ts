import { pullFromCache } from '~/cache/api';
import { checkUserPermission } from './checkUserPermission';

export const checkCommunityPermission = (
  userId: Amity.User['userId'] | undefined,
  permission: string,
  communityId: Amity.Community['communityId'],
) => {
  if (!userId) return false;

  const member = pullFromCache<Amity.Membership<'community'>>([
    'communityUsers',
    'get',
    `${communityId}#${userId}`,
  ])?.data;

  if (!member) return false;

  if (member.permissions.some(x => x === permission)) return true;

  return checkUserPermission(userId, permission);
};
