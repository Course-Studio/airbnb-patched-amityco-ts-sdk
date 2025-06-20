/**
 * ```js
 * import { liveUsers } from '@amityco/ts-sdk'
 *
 * let users = []
 * const unsub = liveUsers({}, response => merge(users, response.data))
 * ```
 *
 * Observe all mutations on a list of {@link Amity.User}s
 *
 * @param params for querying users
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the users
 *
 * @category Category Live Collection
 */
export declare const getUsers: (params: Amity.UserLiveCollection, callback: Amity.LiveCollectionCallback<Amity.User>, config?: Amity.LiveCollectionConfig) => () => void;
