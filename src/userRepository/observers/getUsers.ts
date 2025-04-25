import { dropFromCache } from '~/cache/api';
import { getActiveClient } from '~/client/api';

import { ENABLE_CACHE_MESSAGE } from '~/utils/constants';

import { UserLiveCollectionController } from './getUsers/UserLiveCollectionController';

/* begin_public_function
  id: user.query
*/
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
export const getUsers = (
  params: Amity.UserLiveCollection,
  callback: Amity.LiveCollectionCallback<Amity.User>,
  config?: Amity.LiveCollectionConfig,
) => {
  const { log, cache } = getActiveClient();

  if (!cache) {
    // eslint-disable-next-line no-console
    console.log(ENABLE_CACHE_MESSAGE);
  }

  const timestamp = Date.now();
  log(`liveUsers(tmpid: ${timestamp}) > listen`);

  const usersLiveCollection = new UserLiveCollectionController(params, callback);
  const disposers = usersLiveCollection.startSubscription();

  const cacheKey = usersLiveCollection.getCacheKey();

  disposers.push(() => dropFromCache(cacheKey));

  return () => {
    log(`liveUsers(tmpid: ${timestamp}) > dispose`);
    disposers.forEach(fn => fn());
  };
};
/* end_public_function */
