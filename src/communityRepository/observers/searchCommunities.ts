import { dropFromCache } from '~/cache/api';
import { getActiveClient } from '~/client/api';
import { ENABLE_CACHE_MESSAGE } from '~/utils/constants';
import { SearchCommunityLiveCollectionController } from './searchCommunities/SearchCommunitiesLiveCollectionController';

/* begin_public_function
  id: community.query
*/
/**
 * ```js
 * import { CommunityRepository } from '@amityco/ts-sdk'
 *
 * let communities = []
 * const unsub = CommunityRepository.searchCommunities({
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
export const searchCommunities = (
  params: Amity.SearchCommunityLiveCollection,
  callback: Amity.LiveCollectionCallback<Amity.Community>,
  config?: Amity.LiveCollectionConfig,
) => {
  const { log, cache } = getActiveClient();

  if (!cache) {
    console.log(ENABLE_CACHE_MESSAGE);
  }

  const timestamp = Date.now();
  log(`searchCommunities(tmpid: ${timestamp}) > listen`);

  const searchCommunitiesLiveCollection = new SearchCommunityLiveCollectionController(
    params,
    callback,
  );
  const disposers = searchCommunitiesLiveCollection.startSubscription();

  const cacheKey = searchCommunitiesLiveCollection.getCacheKey();

  disposers.push(() => dropFromCache(cacheKey));

  return () => {
    log(`searchCommunities(tmpid: ${timestamp}) > dispose`);
    disposers.forEach(fn => fn());
  };
};
/* end_public_function */
