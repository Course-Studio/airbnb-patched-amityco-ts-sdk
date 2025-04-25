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
export declare const markItemsSeen: (trayItems: Amity.QueryNotificationItemSeen[]) => Promise<void>;
