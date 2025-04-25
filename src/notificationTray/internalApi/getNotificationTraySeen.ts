import { getActiveClient } from '~/client/api/activeClient';
import { pullFromCache, pushToCache } from '~/cache/api';

/* begin_public_function
  id: notificationTray.getNotificationTraySeen
*/
/**
 * ```js
 * import { notificationTray } from '@amityco/ts-sdk'
 * const notificationTraySeen = await notificationTray.getNotificationTraySeen()
 * ```
 *
 *
 * @returns A page of {@link Amity.NotificationTraySeen} objects
 *
 * @category NotificationTray API
 * @async
 * */
export const getNotificationTraySeen = async (): Promise<
  Amity.Cached<Amity.InternalNotificationTraySeen>
> => {
  const client = getActiveClient();
  client.log('notificationTray/getNotificationTraySeen', {});

  const { data: payload } = await client.http.get<Amity.NotificationTraySeenPayload>(
    `api/v1/notification-tray/tray/seen`,
  );

  const cachedAt = client.cache && Date.now();

  if (client.cache) {
    const cacheKey = ['notificationTraySeen', 'get', client.userId];
    pushToCache(cacheKey, {
      userId: client.userId,
      lastTraySeenAt: payload.lastTraySeenAt,
      lastTrayOccuredAt: payload.lastTrayOccurredAt,
    });
  }

  return {
    data: {
      userId: client.userId!,
      lastTraySeenAt: payload.lastTraySeenAt,
      lastTrayOccurredAt: payload.lastTrayOccurredAt,
      isSeen: payload.lastTraySeenAt > payload.lastTrayOccurredAt,
    },
    cachedAt,
  };
};
/* end_public_function */

/**
 * ```js
 * import { notificationTray } from '@amityco/ts-sdk'
 * const notificationTraySeen = await notificationTray.getNotificationTraySeen.locally()
 * ```
 *
 * Queries a paginable list of {@link Amity.NotificationTraySeen} objects from cache
 *
 * @returns A page of {@link Amity.NotificationTraySeen} objects
 *
 * @category NotificationTray API
 * @async
 * */
getNotificationTraySeen.locally = ():
  | Amity.Cached<Amity.InternalNotificationTraySeen>
  | undefined => {
  const client = getActiveClient();
  client.log('notificationTray/getNotificationTraySeen.locally', {});

  if (!client.cache) return;

  const queryKey = ['notificationTraySeen', 'get'];

  const { data, cachedAt } = pullFromCache<Amity.InternalNotificationTraySeen>(queryKey) ?? {};

  if (!data) return;

  return { data, cachedAt };
};
