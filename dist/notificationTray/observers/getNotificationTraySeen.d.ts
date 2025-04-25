/**
 * ```js
 * import { notificationTray } from '@amityco/ts-sdk';
 *
 * let notificationTraySeen;
 *
 * const unsubscribe = getNotificationTraySeen(response => {
 *   notificationTraySeen = response.data;
 * });
 * ```
 *
 * Observe all mutation on a given {@link Amity.NotificationTraySeen}
 *
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the message
 *
 * @category NotificationTraySeen Live Object
 */
export declare const getNotificationTraySeen: (callback: Amity.LiveObjectCallback<Amity.NotificationTraySeen>) => Amity.Unsubscriber;
