/**
 * ```js
 * import { UserRepository } from '@amityco/ts-sdk'
 * await UserRepository.Relationship.acceptMyFollower('foobar')
 * ```
 *
 * Accept the follow request
 *
 * @param userId the ID of the {@link Amity.InternalUser} follower
 * @returns A success boolean if the follow request was accepted
 *
 * @category Follow API
 * @async
 */
export declare const acceptMyFollower: (userId: Amity.InternalUser['userId']) => Promise<boolean>;
