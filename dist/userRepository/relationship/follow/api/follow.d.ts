/**
 * ```js
 * import { follow } from '@amityco/ts-sdk'
 * const status = await follow('foobar')
 * ```
 *
 * Follow the user
 *
 * @param userId the ID of the {@link Amity.InternalUser}
 * @returns the status {@link Amity.FollowStatus}
 *
 * @category Follow API
 * @async
 */
export declare const follow: (userId: Amity.InternalUser['userId']) => Promise<Amity.Cached<Amity.FollowStatus>>;
