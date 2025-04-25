import { getActiveClient } from '~/client/api';
import { fireEvent } from '~/core/events';
import { pullFromCache, pushToCache } from '~/cache/api';

/* begin_public_function
  id: notificationTray.markSeen
*/
/**
 * ```js
 * import { notificationTray } from '@amityco/ts-sdk'
 * const updated = await notificationTray.markTraySeen({
 *   lastSeenAt: Amity.timestamp,
 * })
 * ```
 *
 * Updates an {@link Amity.NotificationTraySeen}
 *
 * @param userId The ID of the {@link Amity.NotificationTraySeen} to edit
 * @param lastSeenAt The patch data to apply
 * @returns the updated {@link Amity.NotificationTraySeen} object
 *
 * @category Post API
 * @async
 */
export const markTraySeen = async (
  lastSeenAt: Amity.timestamp,
): Promise<Amity.Cached<Amity.NotificationTraySeenUpdatedPayload>> => {
  const client = getActiveClient();
  client.log('notificationTray/markTraySeen', {});

  const { data: payload } = await client.http.post<Amity.NotificationTraySeenUpdatedPayload>(
    `api/v1/notification-tray/tray/seen`,
    {
      lastSeenAt,
    },
  );

  const cacheData = pullFromCache<Amity.InternalNotificationTraySeen>([
    'notificationTraySeen',
    'get',
  ])?.data;

  const data = {
    userId: client.userId!,
    lastTraySeenAt: payload.lastSeenAt,
  } as Amity.InternalNotificationTraySeen;

  const updateCacheData = {
    ...cacheData,
    ...data,
  };

  const cachedAt = client.cache && Date.now();

  if (client.cache)
    pushToCache(['notificationTraySeen', 'get', client.userId!], updateCacheData, { cachedAt });

  fireEvent('local.notificationTraySeen.updated', data);

  return {
    data: payload,
    cachedAt,
  };
};
/* end_public_function */
