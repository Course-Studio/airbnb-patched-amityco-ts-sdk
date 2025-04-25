import { getActiveClient } from '~/client/api';
import { dropFromCache } from '~/cache/api';

import { FollowingLiveCollectionController } from './getFollowings/FollowingLiveCollectionController';

/* begin_public_function
  id: user.relationship.query_my_followings, user.relationship.query_followings
*/
/**
 * ```js
 * import { getFollowings } from '@amityco/ts-sdk'
 *
 * let followings = []
 * const unsub = getFollowings({
 *   userId: Amity.InternalUser['userId'];
 * }, response => merge(followings, response.data))
 * ```
 *
 * Observe all mutations on a list of {@link Amity.FollowStatus} followings for a given userId
 *
 * @param userId the user
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the messages
 *
 * @category Followings Live Collection
 */
export const getFollowings = (
  params: Amity.FollowingLiveCollection,
  callback: Amity.LiveCollectionCallback<Amity.FollowStatus>,
  config?: Amity.LiveCollectionConfig,
): Amity.Unsubscriber => {
  const { log, cache } = getActiveClient();

  if (!cache) {
    console.log('For using Live Collection feature you need to enable Cache!');
  }

  const timestamp = Date.now();
  log(`getFollowings(tmpid: ${timestamp}) > listen`);

  const followingLiveCollection = new FollowingLiveCollectionController(params, callback);
  const disposers = followingLiveCollection.startSubscription();

  const cacheKey = followingLiveCollection.getCacheKey();

  disposers.push(() => dropFromCache(cacheKey));

  return () => {
    log(`getFollowings(tmpid: ${timestamp}) > dispose`);
    disposers.forEach(fn => fn());
  };
};
/* end_public_function */
