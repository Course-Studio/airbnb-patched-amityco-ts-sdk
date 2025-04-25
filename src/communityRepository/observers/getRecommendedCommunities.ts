import { dropFromCache, pullFromCache, pushToCache } from '~/cache/api';
import { getActiveClient } from '~/client/api';
import { ENABLE_CACHE_MESSAGE } from '~/utils/constants';

import { getRecommendedCommunities as _getRecommendedCommunities } from '../api/getRecommendedCommunities';
import { RecommendedCommunityLiveCollectionController } from './getRecommendedCommunities/RecommendedCommunitiesLiveCollectionController';

/* begin_public_function
  id: community.query.recommended_communities
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
export const getRecommendedCommunities = (
  params: Amity.RecommendedCommunityLiveCollection,
  callback: Amity.LiveCollectionCallback<Amity.Community>,
  config?: Amity.LiveCollectionConfig,
) => {
  const { log, cache, userId } = getActiveClient();

  if (!cache) {
    console.log(ENABLE_CACHE_MESSAGE);
  }

  const timestamp = Date.now();
  log(`getRecommendedCommunities(tmpid: ${timestamp}) > listen`);

  const recommendedCommunitiesLiveCollection = new RecommendedCommunityLiveCollectionController(
    params,
    callback,
  );
  const disposers = recommendedCommunitiesLiveCollection.startSubscription();

  const cacheKey = recommendedCommunitiesLiveCollection.getCacheKey();

  disposers.push(() => dropFromCache(cacheKey));

  return () => {
    log(`getRecommendedCommunities(tmpid: ${timestamp}) > dispose`);
    disposers.forEach(fn => fn());
  };
};
/* end_public_function */
