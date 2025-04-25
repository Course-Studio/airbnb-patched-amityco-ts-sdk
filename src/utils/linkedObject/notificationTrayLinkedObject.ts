import { pullFromCache } from '~/cache/api';
import { isNonNullable } from '..';
import { WEEK } from '../constants';
import { userLinkedObject } from './userLinkedObject';

export const notificationTrayLinkedObject = (
  noti: Amity.InternalNotificationTrayItem,
): Amity.NotificationTrayItem => {
  return {
    ...noti,
    isSeen: noti.lastSeenAt > noti.lastOccurredAt,
    isRecent: new Date(noti.lastOccurredAt).getTime() >= Date.now() - WEEK,
    users: noti.actors
      .map(({ publicId }) => pullFromCache<Amity.InternalUser>(['user', 'get', publicId])!)
      .filter(isNonNullable)
      .map(({ data }) => data)
      .map(user => userLinkedObject(user)),
  };
};
