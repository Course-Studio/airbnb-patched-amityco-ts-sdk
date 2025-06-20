/**
 * ```js
 * import { liveUser } from '@amityco/ts-sdk';
 *
 * let user;
 *
 * const unsubscribe = liveUser(userId, response => {
 *   user = response.data;
 * });
 * ```
 *
 * Observe all mutation on a given {@link Amity.User}
 *
 * @param userId the ID of the user to observe
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the user
 *
 * @category Message Live Object
 */
export declare const getUser: (userId: Amity.User["userId"], callback: Amity.LiveObjectCallback<Amity.User>) => Amity.Unsubscriber;
