import { getActiveClient } from '~/client/api';

import { ingestInCache } from '~/cache/api/ingestInCache';

import { prepareCommunityPayload } from '../utils';
import { COLLECTION_DEFAULT_PAGINATION_LIMIT } from '~/utils/constants';

/* begin_public_function
  id: community.query.recommended_communities
*/
/**
 * ```js
 * import { CommunityRepository } from '@amityco/ts-sdk'
 * const communities = await CommunityRepository.getRecommendedCommunities()
 * ```
 *
 * Gets a list of recommended {@link Amity.Community} objects
 *
 * @param query The query parameters
 * @returns A list of {@link Amity.Community} objects
 *
 * @category Community API
 * @async
 * @private
 */
export const getRecommendedCommunities = async (
  query?: Amity.PageLimit,
): Promise<Amity.Cached<Amity.Community[]>> => {
  const client = getActiveClient();
  client.log('community/getRecommendedCommunities', query);

  const { limit = COLLECTION_DEFAULT_PAGINATION_LIMIT } = query ?? {};

  // API-FIX: backend doesnt answer Amity.Response
  // const { data: payload } = await client.http.get<Amity.Response<CommunityPayload>>(
  const { data: payload } = await client.http.get<Amity.CommunityPayload>(
    `/api/v3/communities/recommended`,
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
