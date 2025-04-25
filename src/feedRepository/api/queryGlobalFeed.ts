import { getActiveClient } from '~/client/api/activeClient';

import { ingestInCache } from '~/cache/api/ingestInCache';
import { pullFromCache, pushToCache } from '~/cache/api';
import { getResolver } from '~/core/model';
import { prepareMembershipPayload } from '~/group/utils';
import { LinkedObject } from '~/utils/linkedObject';
import { prepareCommunityPayload } from '~/communityRepository/utils';

/* begin_public_function
  id: feed.query.global_feed
*/
/**
 * ```js
 * import { queryGlobalFeed } from '@amityco/ts-sdk'
 * const posts = await queryGlobalFeed()
 * ```
 *
 * Queries a paginable list of {@link Amity.Post} objects
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.Post} objects
 *
 * @category Feed API
 * @async
 * */
export const queryGlobalFeed = async (
  query?: Amity.QueryGlobalFeed,
): Promise<
  Omit<Amity.Cached<Amity.Paged<Amity.Post> & Amity.Pagination>, 'nextPage' | 'prevPage'>
> => {
  const client = getActiveClient();
  client.log('feed/queryGlobalFeed', query);

  const { queryToken, ...params } = query ?? {};

  const options = (() => {
    if (queryToken) return { token: queryToken };
    return undefined;
  })();

  const { data: queryPayload } = await client.http.get<Amity.PostPayload & Amity.Pagination>(
    `/api/v4/me/global-feeds`,
    {
      params: {
        ...params,
        options,
      },
    },
  );

  const { paging, ...payload } = queryPayload;

  const data = prepareMembershipPayload(payload, 'communityUsers');

  const { posts } = data;

  const { communities: processedCommunity } = prepareCommunityPayload(data);

  const cachedAt = client.cache && Date.now();

  if (client.cache) {
    ingestInCache({ ...data, communitis: processedCommunity });

    const cacheKey = ['globalFeed', 'query', { ...params, options } as Amity.Serializable];
    pushToCache(cacheKey, { posts: posts.map(getResolver('post')), paging });
  }

  return {
    data: posts.map(LinkedObject.post),
    cachedAt,
    paging,
  };
};
/* end_public_function */

/**
 * ```js
 * import { queryGlobalFeed } from '@amityco/ts-sdk'
 * const posts = await queryGlobalFeed.locally()
 * ```
 *
 * Queries a paginable list of {@link Amity.Post} objects from cache
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.Post} objects
 *
 * @category Feed API
 * @async
 * */
queryGlobalFeed.locally = (
  query?: Parameters<typeof queryGlobalFeed>[0],
):
  | Omit<Amity.Cached<Amity.Paged<Amity.Post> & Amity.Pagination>, 'nextPage' | 'prevPage'>
  | undefined => {
  const client = getActiveClient();
  client.log('post/queryGlobalFeed.locally', query);

  if (!client.cache) return;

  const { ...params } = query ?? {};

  const queryKey = ['globalFeed', 'query', { ...params } as Amity.Serializable];
  const { data, cachedAt } =
    pullFromCache<{ posts: Amity.Post['postId'][] } & Amity.Pagination>(queryKey) ?? {};

  if (!data?.posts.length) return;

  const posts: Amity.Post[] = data.posts
    .map(postId => pullFromCache<Amity.InternalPost>(['post', 'get', postId])!)
    .filter(Boolean)
    .map(({ data }) => data)
    .map(LinkedObject.post);

  const { paging } = data;

  return posts.length === data?.posts?.length
    ? {
        data: posts,
        cachedAt,
        paging,
      }
    : undefined;
};
