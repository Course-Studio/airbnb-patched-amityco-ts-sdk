/**
 * ```js
 * import { getFollowings } from '@amityco/ts-sdk'
 *
 * let followings = []
 * const unsub = getFollowings({
 *   userId: Amity.InternalUser['userId'];
 * }, response => merge(followings, response.data))
 * ```
 *
 * Observe all mutations on a list of {@link Amity.FollowStatus} followings for a given userId
 *
 * @param userId the user
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the messages
 *
 * @category Followings Live Collection
 */
export declare const getFollowings: (params: Amity.FollowingLiveCollection, callback: Amity.LiveCollectionCallback<Amity.FollowStatus>, config?: Amity.LiveCollectionConfig) => Amity.Unsubscriber;
