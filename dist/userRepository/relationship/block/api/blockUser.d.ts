/**
 * ```js
 * import { UserRepository } from '@amityco/ts-sdk'
 * const blockedUser = await UserRepository.blockUser('userId')
 * ```
 *
 * Blocks a {@link Amity.InternalUser}
 *
 * @param userId The ID of the {@link Amity.InternalUser} to block
 * @returns the blocked {@link Amity.InternalUser} object
 *
 * @category Post API
 * @async
 */
export declare const blockUser: (userId: Amity.InternalUser['userId']) => Promise<Amity.BlockedPayload>;
