import { pullFromCache, pushToCache } from '~/cache/api';
import { getActiveClient } from '~/client/api';
import { getResolver } from '~/core/model';

import { ingestInCache } from '~/cache/api/ingestInCache';
import { prepareMembershipPayload } from '~/group/utils';

/**
 * ```js
 * import { queryCommunityMembers } from '@amityco/ts-sdk'
 * const communityMembers = await queryCommunityMembers({ communityId: 'foo' })
 * ```
 *
 * Queries a paginable list of {@link Amity.CommunityUser} objects
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.CommunityUser} objects
 *
 * @category Community API
 * @async
 * */
export const queryCommunityMembers = async (
  query: Amity.QueryCommunityMembers,
): Promise<Amity.Cached<Amity.PageToken<Amity.Membership<'community'>>>> => {
  const client = getActiveClient();
  client.log('community/queryCommunityMembers', query);

  const { page, limit, ...params } = query ?? {};

  const options = (() => {
    if (page) return { token: page };
    if (limit) return { limit };

    return undefined;
  })();

  const { data: queryPayload } = await client.http.get<
    Amity.CommunityMembershipPayload & Amity.Pagination
  >(`/api/v3/communities/${params.communityId}/users`, {
    params: {
      ...params,
      options,
    },
  });

  const { paging, ...payload } = queryPayload;
  const preparedPayload = prepareMembershipPayload(payload, 'communityUsers');
  const { communityUsers } = preparedPayload;

  const cachedAt = client.cache && Date.now();
  if (client.cache) {
    ingestInCache(preparedPayload, { cachedAt });

    const cacheKey = ['communityUsers', 'query', { ...params, options } as Amity.Serializable];

    pushToCache(cacheKey, {
      communityUsers: communityUsers.map(({ communityId, userId }) =>
        getResolver('communityUsers')({ communityId, userId }),
      ),
      paging,
    });
  }

  return { data: communityUsers, cachedAt, paging };
};

/**
 * ```js
 * import { queryCommunityMembers } from '@amityco/ts-sdk'
 * const communityMembers = await queryCommunityMembers(query)
 * ```
 *
 * Queries a paginable list of {@link Amity.InternalPost} objects from cache
 *
 * @param query The query parameters
 * @returns posts
 *
 * @category Post API
 */
queryCommunityMembers.locally = (
  query: Parameters<typeof queryCommunityMembers>[0],
): Amity.Cached<Amity.PageToken<Amity.Membership<'community'>>> | undefined => {
  const client = getActiveClient();
  client.log('community/queryCommunityMembers', query);

  if (!client.cache) return;

  const { page, limit, ...params } = query ?? {};

  const options = (() => {
    if (page) return { token: page };
    if (limit) return { limit };

    return undefined;
  })();

  const cacheKey = ['communityUsers', 'query', { ...params, options } as Amity.Serializable];

  const { data, cachedAt } =
    pullFromCache<
      {
        communityUsers: Pick<Amity.Membership<'community'>, 'communityId' | 'userId'>[];
      } & Amity.Pagination
    >(cacheKey) ?? {};

  if (!data?.communityUsers.length) return;

  const communityUsers: Amity.Membership<'community'>[] = data.communityUsers
    .map(key => pullFromCache<Amity.Membership<'community'>>(['communityUsers', 'get', key])!)
    .filter(Boolean)
    .map(({ data }) => data);

  const { paging } = data;

  return communityUsers.length === data?.communityUsers?.length
    ? { data: communityUsers, cachedAt, paging }
    : undefined;
};
