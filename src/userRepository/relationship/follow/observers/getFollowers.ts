import { getActiveClient } from '~/client/api';
import { dropFromCache } from '~/cache/api';

import { ENABLE_CACHE_MESSAGE } from '~/utils/constants';

import { FollowerLiveCollectionController } from './getFollowers/FollowerLiveCollectionController';

/* begin_public_function
  id: user.relationship.query_my_followers, user.relationship.query_followers
*/
/**
 * ```js
 * import { getFollowers } from '@amityco/ts-sdk'
 *
 * let followers = []
 * const unsub = getFollowers({
 *   userId: Amity.InternalUser['userId'];
 * }, response => merge(followers, response.data))
 * ```
 *
 * Observe all mutations on a list of {@link Amity.FollowStatus} followers for a given userId
 *
 * @param userId the user
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the messages
 *
 * @category Followers Live Collection
 */
export const getFollowers = (
  params: Amity.FollowerLiveCollection,
  callback: Amity.LiveCollectionCallback<Amity.FollowStatus>,
  config?: Amity.LiveCollectionConfig,
): Amity.Unsubscriber => {
  const { log, cache } = getActiveClient();

  if (!cache) {
    console.log(ENABLE_CACHE_MESSAGE);
  }

  const timestamp = Date.now();
  log(`getFollowers(tmpid: ${timestamp}) > listen`);

  const followerLiveCollection = new FollowerLiveCollectionController(params, callback);
  const disposers = followerLiveCollection.startSubscription();

  const cacheKey = followerLiveCollection.getCacheKey();

  disposers.push(() => dropFromCache(cacheKey));

  return () => {
    log(`getFollowers(tmpid: ${timestamp}) > dispose`);
    disposers.forEach(fn => fn());
  };
};
/* end_public_function */
