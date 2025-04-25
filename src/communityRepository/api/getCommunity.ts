import { getActiveClient } from '~/client/api';

import { pullFromCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';

import { saveCommunityUsers } from '~/communityRepository/utils/saveCommunityUsers';
import { prepareCommunityPayload } from '../utils';

/**
 * ```js
 * import { CommunityRepository } from '@amityco/ts-sdk'
 * const community = await CommunityRepository.getCommunity('foobar')
 * ```
 *
 * Fetches a {@link Amity.Community} object
 *
 * @param communityId the ID of the {@link Amity.Community} to fetch
 * @returns the associated {@link Amity.Community} object
 *
 * @category Community API
 * @async
 */
export const getCommunity = async (
  communityId: Amity.Community['communityId'],
): Promise<Amity.Cached<Amity.Community>> => {
  const client = getActiveClient();
  client.log('community/getCommunity', communityId);

  // API-FIX: endpoint should not be /list, parameters should be querystring.
  const { data: payload } = await client.http.get<Amity.CommunityPayload>(
    `/api/v3/communities/${communityId}`,
  );

  const data = prepareCommunityPayload(payload);

  const cachedAt = client.cache && Date.now();
  if (client.cache) {
    ingestInCache(data, { cachedAt });
    saveCommunityUsers(data.communities, data.communityUsers);
  }

  const { communities } = data;

  return {
    data: communities.find(community => community.communityId === communityId)!,
    cachedAt,
  };
};

/**
 * ```js
 * import { CommunityRepository } from '@amityco/ts-sdk'
 * const community = CommunityRepository.getCommunity.locally('foobar')
 * ```
 *
 * Fetches a {@link Amity.Community} object from cache
 *
 * @param communityId the ID of the {@link Amity.Community} to fetch
 * @returns the associated {@link Amity.Community} object
 *
 * @category Community API
 */
getCommunity.locally = (
  communityId: Amity.Community['communityId'],
): Amity.Cached<Amity.Community> | undefined => {
  const client = getActiveClient();
  client.log('community/getCommunity.locally', communityId);

  if (!client.cache) return;

  const cached = pullFromCache<Amity.Community>(['community', 'get', communityId]);

  if (!cached) return;

  return {
    data: cached.data,
    cachedAt: cached.cachedAt,
  };
};
