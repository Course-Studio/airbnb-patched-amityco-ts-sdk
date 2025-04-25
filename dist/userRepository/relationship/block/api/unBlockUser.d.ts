/**
 * ```js
 * import { UserRepository } from '@amityco/ts-sdk'
 * const unblockedUser = await UserRepository.blockUser('userId')
 * ```
 *
 * Blocks a {@link Amity.InternalUser}
 *
 * @param userId The ID of the {@link Amity.InternalUser} to unblock
 * @returns the unblocked {@link Amity.InternalUser} object
 *
 * @category Post API
 * @async
 */
export declare const unBlockUser: (userId: Amity.InternalUser['userId']) => Promise<Amity.BlockedPayload>;
//# sourceMappingURL=unBlockUser.d.ts.map