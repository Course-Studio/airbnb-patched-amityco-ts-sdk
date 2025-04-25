import { pullFromCache } from '~/cache/api';
import { checkUserPermission } from './checkUserPermission';

export const checkChannelPermission = (
  userId: Amity.User['userId'] | undefined,
  permission: string,
  channelId: Amity.Channel['channelId'],
) => {
  if (!userId) return false;

  const member = pullFromCache<Amity.Membership<'channel'>>([
    'channelUsers',
    'get',
    `${channelId}#${userId}`,
  ])?.data;

  if (!member) return false;

  if (member.permissions.some(x => x === permission)) return true;

  return checkUserPermission(userId, permission);
};
