import { getActiveClient } from '~/client/api';
import { pushToCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { getResolver } from '~/core/model';

import { inferIsDeleted } from '~/utils/inferIsDeleted';
import { saveCommunityUsers } from '~/communityRepository/utils/saveCommunityUsers';
import { prepareCommunityPayload } from '../utils';

/**
 * ```js
 * import { queryCommunities } from '@amityco/ts-sdk'
 * const communities = await queryCommunities()
 * ```
 *
 * Queries a paginable list of {@link Amity.Community} objects
 * Search is performed by displayName such as `.startsWith(search)`
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.Community} objects
 *
 * @category Community API
 * @async
 */
export const queryCommunities = async (
  query?: Amity.QueryCommunities,
): Promise<Amity.Cached<Amity.PageToken<Amity.Community>>> => {
  const client = getActiveClient();
  client.log('channel/queryCommunities', query);

  // safe decapsulation
  const { page, limit = 10, ...params } = query ?? {};
  const { membership, includeDeleted, ...restParams } = params ?? {};

  const options = (() => {
    if (page) return { token: page };
    if (limit) return { limit };

    return undefined;
  })();

  // API-FIX: parameters should be querystring.
  // API-FIX: backend doesn't answer Amity.Response
  // const { data } = await client.http.get<Amity.Response<Amity.PagedResponse<CommunityPayload>>>(
  const { data } = await client.http.get<Amity.CommunityPayload & Amity.Pagination>(
    `/api/v3/communities`,
    {
      params: {
        ...restParams,
        isDeleted: inferIsDeleted(includeDeleted),
        filter: membership,
        options,
      },
    },
  );

  const { paging, ...payload } = data;
  const unpackedPayload = prepareCommunityPayload(payload);
  const { communities } = unpackedPayload;

  const cachedAt = client.cache && Date.now();

  if (client.cache) {
    ingestInCache(unpackedPayload, { cachedAt });

    const cacheKey = ['community', 'query', { ...params, options } as Amity.Serializable];
    pushToCache(cacheKey, { communities: communities.map(getResolver('community')), paging });
    saveCommunityUsers(data.communities, data.communityUsers);
  }

  return { data: communities, cachedAt, paging };
};
