/**
 * ```js
 * import { UserRepository } from '@amityco/ts-sdk'
 *
 * let users = []
 * const unsub = UserRepository.searchUserByDisplayName({}, response => merge(users, response.data))
 * ```
 *
 * Observe all mutations on a list of {@link Amity.InternalUser}s
 *
 * @param params for searching users
 * @param callback the function to call when new data are available
 * @param config the configuration for the live collection
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the users
 *
 * @category Category Live Collection
 */
export declare const searchUserByDisplayName: (params: Amity.UserSearchLiveCollection, callback: Amity.LiveCollectionCallback<Amity.InternalUser>, config?: Amity.LiveCollectionConfig) => () => void;
//# sourceMappingURL=searchUserByDisplayName.d.ts.map