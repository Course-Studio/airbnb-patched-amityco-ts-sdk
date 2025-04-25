/**
 *
 * ```js
 * import { getUserUnread } from '@amityco/ts-sdk';
 *
 * const unsubscribe = getUserUnread(response => {
 *   userUnread = response.data;
 * });
 * ```
 *
 * Observe current user's unread including unreadCount and hasMentioned from {@link Amity.UserMarker}
 *
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the events
 *
 * @category Message Live Object
 */
export declare const getUserUnread: (callback: Amity.LiveObjectCallback<Amity.UserUnread | undefined>) => Amity.Unsubscriber;
