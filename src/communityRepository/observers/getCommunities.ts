import { dropFromCache } from '~/cache/api';
import { getActiveClient } from '~/client/api';
import { ENABLE_CACHE_MESSAGE } from '~/utils/constants';
import { CommunityLiveCollectionController } from './getCommunities/CommunitiesLiveCollectionController';

/* begin_public_function
  id: community.query
*/
/**
 * ```js
 * import { CommunityRepository } from '@amityco/ts-sdk'
 *
 * let communities = []
 * const unsub = CommunityRepository.getCommunities({
 *   displayName: Amity.Community['displayName'],
 * }, response => merge(communities, response.data))
 * ```
 *
 * Observe all mutations on a list of {@link Amity.Community}s
 *
 * @param params for querying communities
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the communities
 *
 * @category Community Live Collection
 */
export const getCommunities = (
  params: Amity.CommunityLiveCollection,
  callback: Amity.LiveCollectionCallback<Amity.Community>,
  config?: Amity.LiveCollectionConfig,
) => {
  const { log, cache } = getActiveClient();

  if (!cache) {
    console.log(ENABLE_CACHE_MESSAGE);
  }

  const timestamp = Date.now();
  log(`getCommunities(tmpid: ${timestamp}) > listen`);

  const communitiesLiveCollection = new CommunityLiveCollectionController(params, callback);
  const disposers = communitiesLiveCollection.startSubscription();

  const cacheKey = communitiesLiveCollection.getCacheKey();

  disposers.push(() => dropFromCache(cacheKey));

  return () => {
    log(`getCommunities(tmpid: ${timestamp}) > dispose`);
    disposers.forEach(fn => fn());
  };
};
/* end_public_function */
