import { pullFromCache } from '~/cache/api';

export const checkUserPermission = (
  userId: Amity.User['userId'] | undefined,
  permission: string,
) => {
  const user = pullFromCache<Amity.User>(['user', 'get', userId])?.data;

  if (!user) return false;

  return user.permissions.some(x => x === permission);
};
