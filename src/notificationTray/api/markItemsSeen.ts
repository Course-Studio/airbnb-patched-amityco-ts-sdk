import { getActiveClient } from '~/client/api/activeClient';
import { fireEvent } from '~/core/events';
import { pullFromCache, pushToCache } from '~/cache/api';

/* begin_public_function
  id: notificationTrayItem.markSeen
*/
/**
 * ```js
 * import { notificationTray } from '@amityco/ts-sdk'
 * const updated = await notificationTray.markItemsSeen()
 * ```
 *
 * Updates an {@link Amity.NotificationItemSeen}
 *
 * @param trayItems[] that include id and lastTraySeenAt, The ID of the {@link Amity.NotificationItemSeen} to edit
 * @returns the updated {@link Amity.NotificationItemSeen} object
 *
 * @category NotificationItemSeen API
 * @async
 */
export const markItemsSeen = async (trayItems: Amity.QueryNotificationItemSeen[]) => {
  const client = getActiveClient();
  client.log('notificationTray/markItemsSeen', {});

  const { data: payload } = await client.http.post<Amity.NotificationItemSeenPayload>(
    `api/v1/notification-tray/items/seen`,
    {
      trayItems: trayItems.map(item => ({
        id: item.id,
        lastSeenAt: item.lastSeenAt,
      })),
    },
  );

  const updatedData = payload.trayItems
    .map(patchItem => {
      const cacheData = pullFromCache<Amity.InternalNotificationTrayItem>([
        'notificationTrayItem',
        'get',
        patchItem.id,
      ])?.data;

      if (!cacheData) return;

      const data = {
        ...cacheData,
        lastSeenAt: patchItem.lastSeenAt,
      };

      if (client.cache) {
        const cachedAt = Date.now();
        pushToCache(['notificationTrayItem', 'get'], data, { cachedAt });
      }

      return data;
    })
    .filter(Boolean) as Amity.InternalNotificationTrayItem[];

  fireEvent('local.notificationTrayItem.updated', { notificationTrayItems: updatedData });
};
/* end_public_function */
