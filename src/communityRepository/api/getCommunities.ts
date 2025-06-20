import { getActiveClient } from '~/client/api';

import { pullFromCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';

import { saveCommunityUsers } from '~/communityRepository/utils/saveCommunityUsers';
import { prepareCommunityPayload } from '../utils';

/**
 * ```js
 * import { getCommunities } from '@amityco/ts-sdk'
 * const communities = await getCommunities(['foo', 'bar'])
 * ```
 *
 * Fetches a collection of {@link Amity.Community} objects
 *
 * @param communityIds the IDs of the {@link Amity.Community} to fetch
 * @returns the associated collection of {@link Amity.Community} objects
 *
 * @category Community API
 * @async
 */
export const getCommunities = async (
  communityIds: Amity.Community['communityId'][],
): Promise<Amity.Cached<Amity.Community[]>> => {
  const client = getActiveClient();
  client.log('community/getCommunities', communityIds);

  // API-FIX: endpoint should not be /list, parameters should be querystring.
  const { data: payload } = await client.http.get<Amity.CommunityPayload>(
    `/api/v3/communities/list`,
    {
      params: { communityIds },
    },
  );

  const data = prepareCommunityPayload(payload);

  const cachedAt = client.cache && Date.now();
  if (client.cache) {
    ingestInCache(data, { cachedAt });
    saveCommunityUsers(data.communities, data.communityUsers);
  }

  return {
    data: data.communities,
    cachedAt,
  };
};

/**
 * ```js
 * import { getCommunities } from '@amityco/ts-sdk'
 * const communities = getCommunities.locally(['foo', 'bar']) ?? []
 * ```
 *
 * Fetches a collection of {@link Amity.Community} objects from cache
 *
 * @param communityIds the IDs of the {@link Amity.Community} to fetch
 * @returns the associated collection of {@link Amity.Community} objects
 *
 * @category Community API
 */
getCommunities.locally = (
  communityIds: Amity.Community['communityId'][],
): Amity.Cached<Amity.Community[]> | undefined => {
  const client = getActiveClient();
  client.log('community/getCommunities.locally', communityIds);

  if (!client.cache) return;

  const cached = communityIds
    .map(communityId => pullFromCache<Amity.Community>(['community', 'get', communityId])!)
    .filter(Boolean);

  const communities = cached.map(({ data }) => data);
  const oldest = cached.sort((a, b) => (a.cachedAt! < b.cachedAt! ? -1 : 1))?.[0];

  if (cached?.length < communityIds.length) return;

  return {
    data: communities,
    cachedAt: oldest.cachedAt,
  };
};
