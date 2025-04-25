import { getActiveClient } from '~/client/api';

import { ingestInCache } from '~/cache/api/ingestInCache';

import { prepareCommunityPayload } from '../utils';
import { COLLECTION_DEFAULT_PAGINATION_LIMIT } from '~/utils/constants';

/**
 * ```js
 * import { CommunityRepository } from '@amityco/ts-sdk'
 * const trendingCommunities = await CommunityRepository.getTrendingCommunities()
 * ```
 *
 * Gets a list of top trending {@link Amity.Community} objects
 *
 * @param query The query parameters
 * @returns A list of {@link Amity.Community} objects
 *
 * @category Community API
 * @async
 * @private
 */
export const getTrendingCommunities = async (
  query?: Amity.PageLimit,
): Promise<Amity.Cached<Amity.Community[]>> => {
  const client = getActiveClient();
  client.log('community/getTrendingCommunities', query);

  const { limit = COLLECTION_DEFAULT_PAGINATION_LIMIT } = query ?? {};

  // API-FIX: backend doesnt answer Amity.Response
  // const { data } = await client.http.get<Amity.Response<CommunityPayload>>(
  const { data: payload } = await client.http.get<Amity.CommunityPayload>(
    `/api/v3/communities/top-trending`,
    { params: { options: { limit } } },
  );

  const data = prepareCommunityPayload(payload);
  const { communities } = data;

  const cachedAt = client.cache && Date.now();

  if (client.cache) {
    ingestInCache(data, { cachedAt });
  }

  return { data: communities, cachedAt };
};
