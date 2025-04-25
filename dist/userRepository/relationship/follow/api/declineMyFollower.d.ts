/**
 * ```js
 * import { UserRepository } from '@amityco/ts-sdk'
 * await UserRepository.Relationship.declineMyFollower('foobar')
 * ```
 *
 * Decline the follow request or delete the follower
 *
 * @param userId the ID of the {@link Amity.InternalUser} follower
 * @returns A success boolean if the follow request was decline
 *
 * @category Follow API
 * @async
 */
export declare const declineMyFollower: (userId: Amity.InternalUser["userId"]) => Promise<boolean>;
