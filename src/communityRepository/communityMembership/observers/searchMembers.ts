import { getActiveClient } from '~/client/api';
import { ENABLE_CACHE_MESSAGE } from '~/utils/constants';
import { dropFromCache } from '~/cache/api';
import { SearchCommunityMembersLiveCollectionController } from './searchMembers/SearchCommunityMembersLiveCollectionController';

/* begin_public_function
  id: community.membership.query
*/
/**
 * ```js
 * import { searchMembers } from '@amityco/ts-sdk'
 *
 * let communityMembers = []
 * const unsub = searchMembers({
 *   communityId: Amity.Community['communityId'],
 * }, response => merge(communityMembers, response.data))
 * ```
 *
 * Observe all mutations on a list of {@link Amity.CommunityUser}s
 *
 * @param params for querying community users
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the community users
 *
 * @category Community Live Collection
 */
export const searchMembers = (
  params: Amity.SearchCommunityMemberLiveCollection,
  callback: Amity.LiveCollectionCallback<Amity.Membership<'community'>>,
  config?: Amity.LiveCollectionConfig,
) => {
  const { log, cache } = getActiveClient();

  if (!cache) {
    console.log(ENABLE_CACHE_MESSAGE);
  }

  const timestamp = Date.now();
  log(`getMembers(tmpid: ${timestamp}) > listen`);

  const searchCommunityMemberLiveCollection = new SearchCommunityMembersLiveCollectionController(
    params,
    resp => {
      callback(resp);
    },
  );
  const disposers = searchCommunityMemberLiveCollection.startSubscription();

  const cacheKey = searchCommunityMemberLiveCollection.getCacheKey();

  disposers.push(() => {
    dropFromCache(cacheKey);
  });

  return () => {
    log(`getMembers(tmpid: ${timestamp}) > dispose`);
    disposers.forEach(fn => fn());
  };
};
/* end_public_function */
