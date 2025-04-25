import {
  filterByCommunityMembership,
  filterByPropEquality,
  sortByFirstCreated,
  sortByLastCreated,
} from '~/core/query';

export const communityQueryFilter = (
  data: Amity.Community[],
  params: Amity.CommunityLiveCollection,
  userId: string,
): Amity.Community[] => {
  let communities = data;

  if (!params.includeDeleted) {
    communities = filterByPropEquality(communities, 'isDeleted', false);
  }

  if (params.categoryId) {
    communities = communities.filter(c => c.categoryIds?.includes(params.categoryId!));
  }

  if (params.tags) {
    communities = communities.filter(c => c.tags?.some(t => params.tags?.includes(t)));
  }

  if (params.membership && userId) {
    communities = filterByCommunityMembership(communities, params.membership, userId);
  }

  const sortBy = params.sortBy || 'lastCreated';

  if (sortBy === 'lastCreated' || sortBy === 'firstCreated') {
    communities = communities.sort(
      sortBy === 'lastCreated' ? sortByLastCreated : sortByFirstCreated,
    );
  }

  /*
   * The server returns communities with empty | null displayName's first before
   * returning sorted list of communities with displayNames
   *
   * This section needs to be updated as displayNames can be null as well
   */

  return communities;
};
