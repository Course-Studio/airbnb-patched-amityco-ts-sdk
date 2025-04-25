/**
 * ```js
 * import { UserRepository } from '@amityco/ts-sdk'
 * const unblockedUser = await UserRepository.blockUser('userId')
 * ```
 *
 * Blocks a {@link Amity.InternalUser}
 *
 * @param params The params to get blocked {@link Amity.InternalUser}s
 * @param callback to recieve updates on unblocked {@link Amity.InternalUser}s
 * @returns {@link Amity.Unsubscriber} to unsubscribe from collection
 *
 * @category Post API
 * @async
 */
export declare const getBlockedUsers: (params: Amity.BlockedUsersLiveCollection, callback: Amity.LiveCollectionCallback<Amity.InternalUser>, config?: Amity.LiveCollectionConfig) => Amity.Unsubscriber;
//# sourceMappingURL=getBlockedUsers.d.ts.map