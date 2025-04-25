/**
 * ```js
 * import { getFollowers } from '@amityco/ts-sdk'
 *
 * let followers = []
 * const unsub = getFollowers({
 *   userId: Amity.InternalUser['userId'];
 * }, response => merge(followers, response.data))
 * ```
 *
 * Observe all mutations on a list of {@link Amity.FollowStatus} followers for a given userId
 *
 * @param userId the user
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the messages
 *
 * @category Followers Live Collection
 */
export declare const getFollowers: (params: Amity.FollowerLiveCollection, callback: Amity.LiveCollectionCallback<Amity.FollowStatus>, config?: Amity.LiveCollectionConfig) => Amity.Unsubscriber;
//# sourceMappingURL=getFollowers.d.ts.map