/**
 * ```js
 * import { UserRepository } from '@amityco/ts-sdk';
 *
 * let myFollowInfo;
 *
 * const unsubscribe = UserRepository.Relationship.getMyFollowInfo(response => {
 *   myFollowInfo = response.data;
 * });
 * ```
 *
 * Observe all mutation on the current users {@link Amity.FollowCount} object
 *
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing
 *
 * @category FollowInfo Live Object
 */
export declare const getMyFollowInfo: (callback: Amity.LiveObjectCallback<Amity.FollowInfo>) => Amity.Unsubscriber;
