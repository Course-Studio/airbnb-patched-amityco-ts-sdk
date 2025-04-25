import { getActiveClient } from '~/client/api';
import {
  filterByPropIntersection,
  filterBySearchTerm,
  sortByFirstCreated,
  sortByLastCreated,
} from '~/core/query';
import { ENABLE_CACHE_MESSAGE } from '~/utils/constants';
import { CommunityMembersLiveCollectionController } from './getMembers/CommunityMembersLiveCollectionController';
import { dropFromCache } from '~/cache/api';

/*
 * Exported for testing
 * @hidden
 */
export const applyFilter = <T extends Amity.Membership<'community'>>(
  data: T[],
  params: Amity.CommunityMemberLiveCollection,
): T[] => {
  let communityMembers = filterByPropIntersection(data, 'roles', params.roles);

  if (params.memberships) {
    communityMembers = communityMembers.filter(({ communityMembership }) => {
      const membership = params.memberships as Amity.GroupMembership[];
      return membership.includes(communityMembership);
    });
  }

  const sortBy = params.sortBy ? params.sortBy : 'lastCreated';
  communityMembers = communityMembers.sort(
    sortBy === 'lastCreated' ? sortByLastCreated : sortByFirstCreated,
  );

  return communityMembers;
};

/* begin_public_function
  id: community.membership.query
*/
/**
 * ```js
 * import { getMembers } from '@amityco/ts-sdk'
 *
 * let communityMembers = []
 * const unsub = getMembers({
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
export const getMembers = (
  params: Amity.CommunityMemberLiveCollection,
  callback: Amity.LiveCollectionCallback<Amity.Membership<'community'>>,
  config?: Amity.LiveCollectionConfig,
) => {
  const { log, cache } = getActiveClient();

  if (!cache) {
    console.log(ENABLE_CACHE_MESSAGE);
  }

  const timestamp = Date.now();
  log(`getMembers(tmpid: ${timestamp}) > listen`);

  const communityMemberLiveCollection = new CommunityMembersLiveCollectionController(
    params,
    resp => {
      callback(resp);
    },
  );
  const disposers = communityMemberLiveCollection.startSubscription();

  const cacheKey = communityMemberLiveCollection.getCacheKey();

  disposers.push(() => {
    dropFromCache(cacheKey);
  });

  return () => {
    log(`getMembers(tmpid: ${timestamp}) > dispose`);
    disposers.forEach(fn => fn());
  };
};
/* end_public_function */
