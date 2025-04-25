import { dropFromCache } from '~/cache/api';
import { getActiveClient } from '~/client/api';
import { ENABLE_CACHE_MESSAGE } from '~/utils/constants';

import { getTrendingCommunities as _getTrendingCommunities } from '../api/getTrendingCommunities';
import { TrendingCommunityLiveCollectionController } from './getTrendingCommunities/TrendingCommunitiesLiveCollectionController';

/* begin_public_function
  id: community.query.trending_communities
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
export const getTrendingCommunities = (
  params: Amity.TrendingCommunityLiveCollection,
  callback: Amity.LiveCollectionCallback<Amity.Community>,
  config?: Amity.LiveCollectionConfig,
) => {
  const { log, cache, userId } = getActiveClient();

  if (!cache) {
    console.log(ENABLE_CACHE_MESSAGE);
  }

  const timestamp = Date.now();
  log(`getTrendingCommunities(tmpid: ${timestamp}) > listen`);

  const trendingCommunitiesLiveCollection = new TrendingCommunityLiveCollectionController(
    params,
    callback,
  );
  const disposers = trendingCommunitiesLiveCollection.startSubscription();

  const cacheKey = trendingCommunitiesLiveCollection.getCacheKey();

  disposers.push(() => dropFromCache(cacheKey));

  return () => {
    log(`getTrendingCommunities(tmpid: ${timestamp}) > dispose`);
    disposers.forEach(fn => fn());
  };
};
/* end_public_function */
