/**
 * ```js
 * import { onNotificationTraySeenUpdated } from '@amityco/ts-sdk'
 * const dispose = onNotificationTraySeenUpdated(data => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.NotificationTraySeen} has been updated
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category NotificationTraySeen Events
 */
export declare const onNotificationTraySeenUpdated: (callback: Amity.Listener<Amity.InternalNotificationTraySeen>) => Amity.Unsubscriber;
