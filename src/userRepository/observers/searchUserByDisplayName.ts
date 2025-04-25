import { getActiveClient } from '~/client';
import { getUsers } from './getUsers';
import { ENABLE_CACHE_MESSAGE } from '~/utils/constants';
import { SearchUserLiveCollectionController } from './searchUserByDisplayName/SearchUserLiveCollectionController';
import { dropFromCache } from '~/cache/api';

/* begin_public_function
  id: user.search
*/
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
export const searchUserByDisplayName = (
  params: Amity.UserSearchLiveCollection,
  callback: Amity.LiveCollectionCallback<Amity.InternalUser>,
  config?: Amity.LiveCollectionConfig,
) => {
  const { log, cache } = getActiveClient();

  if (!cache) {
    // eslint-disable-next-line no-console
    console.log(ENABLE_CACHE_MESSAGE);
  }

  const timestamp = Date.now();
  log(`liveSearchUsers(tmpid: ${timestamp}) > listen`);

  const searchUsersLiveCollection = new SearchUserLiveCollectionController(params, callback);
  const disposers = searchUsersLiveCollection.startSubscription();

  const cacheKey = searchUsersLiveCollection.getCacheKey();

  disposers.push(() => dropFromCache(cacheKey));

  return () => {
    log(`liveSearchUsers(tmpid: ${timestamp}) > dispose`);
    disposers.forEach(fn => fn());
  };
};
/* end_public_function */
