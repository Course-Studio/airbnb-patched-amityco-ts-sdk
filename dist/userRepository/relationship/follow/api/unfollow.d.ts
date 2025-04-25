/**
 * ```js
 * import { unfollow } from '@amityco/ts-sdk'
 * await unfollow('foobar')
 * ```
 *
 * Cancel the follow request or unfollow the user
 *
 * @param userId the ID of the {@link Amity.InternalUser}
 * @returns A success boolean if the user {@link Amity.InternalUser} was unfollowed
 *
 * @category Follow API
 * @async
 */
export declare const unfollow: (userId: Amity.InternalUser['userId']) => Promise<boolean>;
//# sourceMappingURL=unfollow.d.ts.map