/**
 * ```js
 * import { getFollowInfo } from '@amityco/ts-sdk'
 * const { data: followInfo } = await getFollowInfo('foobar')
 * ```
 *
 * Fetches the number of followers, followings, pending requests and the follow status for current user
 *
 * @param userId the ID of the {@link Amity.InternalUser}
 * @returns the associated {@link Amity.FollowInfo} object
 *
 * @category Follow API
 * @async
 */
export declare const getFollowInfo: {
    (userId: Amity.InternalUser['userId']): Promise<Amity.Cached<Amity.FollowInfo>>;
    /**
     * ```js
     * import { getFollowInfo } from '@amityco/ts-sdk'
     * const { data: followInfo } = getFollowInfo.locally('foobar')
     * ```
     *
     * Fetches the number of followers, followings, pending requests and the follow status for current user from cache
     *
     * @param userId the ID of the {@link Amity.InternalUser}
     * @returns the associated {@link Amity.FollowInfo} object
     *
     * @category Follow API
     */
    locally(userId: Amity.InternalUser['userId']): Amity.Cached<Amity.FollowInfo> | undefined;
};
//# sourceMappingURL=getFollowInfo.d.ts.map