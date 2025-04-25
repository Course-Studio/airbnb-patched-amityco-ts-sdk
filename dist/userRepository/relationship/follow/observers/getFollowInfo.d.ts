/**
 * ```js
 * import { UserRepository } from '@amityco/ts-sdk';
 *
 * let followInfo;
 *
 * const unsubscribe = UserRepository.Relationship.getFollowInfo(userId, response => {
 *   followInfo = response.data;
 * });
 * ```
 *
 * Observe all mutation on a given {@link Amity.FollowCount} object
 *
 * @param userId the ID of the current user
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing
 *
 * @category FollowInfo Live Object
 */
export declare const getFollowInfo: (userId: Amity.FollowInfo['userId'], callback: Amity.LiveObjectCallback<Amity.FollowInfo>) => Amity.Unsubscriber;
