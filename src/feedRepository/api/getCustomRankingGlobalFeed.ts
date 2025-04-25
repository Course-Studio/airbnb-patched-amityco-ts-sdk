import { getActiveClient } from '~/client/api/activeClient';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { pullFromCache, pushToCache } from '~/cache/api';
import { getResolver } from '~/core/model';
import { prepareMembershipPayload } from '~/group/utils';
import { LinkedObject } from '~/utils/linkedObject';

/* begin_public_function
  id: feed.query.custom_ranking_feed
*/
/**
 * ```js
 * import { FeedRepository } from '@amityco/ts-sdk'
 * const posts = await FeedRepository.getCustomRankingGlobalFeed()
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
export const getCustomRankingGlobalFeed = async (query?: {
  dataTypes?: ('video' | 'image' | 'file' | 'liveStream')[];
  limit?: number;
  queryToken?: string;
}): Promise<
  Omit<Amity.Cached<Amity.Paged<Amity.Post>> & Amity.Pagination, 'nextPage' | 'prevPage'>
> => {
  const client = getActiveClient();
  client.log('feed/getCustomRankingGlobalFeed', query);

  const { queryToken, limit, ...params } = query ?? {};

  const options = (() => {
    if (queryToken) return { token: queryToken };
    return undefined;
  })();

  const { data: queryPayload } = await client.http.get<Amity.PostPayload & Amity.Pagination>(
    `/api/v5/me/global-feeds`,
    {
      params: {
        ...params,
        limit: !queryToken ? limit : undefined,
        options,
      },
    },
  );

  const { paging, ...payload } = queryPayload;

  const data = prepareMembershipPayload(payload, 'communityUsers');

  const { posts } = data;

  const cachedAt = client.cache && Date.now();

  if (client.cache) {
    ingestInCache(data);

    const cacheKey = ['customGlobalFeed', 'query', { ...params, options } as Amity.Serializable];
    pushToCache(cacheKey, { posts: posts.map(getResolver('post')), paging });
  }

  return { data: posts.map(LinkedObject.post), cachedAt, paging };
};
/* end_public_function */

/**
 * ```js
 * import { FeedRepository } from '@amityco/ts-sdk'
 * const posts = await FeedRepository.getCustomRankingGlobalFeed.locally()
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
getCustomRankingGlobalFeed.locally = (
  query?: Parameters<typeof getCustomRankingGlobalFeed>[0],
):
  | Omit<Amity.Cached<Amity.Paged<Amity.Post>> & Amity.Pagination, 'nextPage' | 'prevPage'>
  | undefined => {
  const client = getActiveClient();
  client.log('post/getCustomRankingGlobalFeed.locally', query);

  if (!client.cache) return;

  const { ...params } = query ?? {};

  const queryKey = ['customGlobalFeed', 'query', { ...params } as Amity.Serializable];

  const { data, cachedAt } =
    pullFromCache<{ posts: Amity.Post['postId'][] } & Amity.Pagination>(queryKey) ?? {};

  if (!data?.posts.length) return;

  const posts: Amity.InternalPost[] = data.posts
    .map(postId => pullFromCache<Amity.InternalPost>(['post', 'get', postId])!)
    .filter(Boolean)
    .map(({ data }) => data);

  const { paging } = data;

  return posts.length === data?.posts?.length
    ? { data: posts.map(LinkedObject.post), cachedAt, paging }
    : undefined;
};
