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
export declare const markTraySeen: (lastSeenAt: Amity.timestamp) => Promise<Amity.Cached<Amity.NotificationTraySeenUpdatedPayload>>;
