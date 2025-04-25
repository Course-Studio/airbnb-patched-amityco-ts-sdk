import { getActiveClient } from '~/client/api';

import { toPageRaw, toToken } from '~/core/query';

import { pushToCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { getResolver } from '~/core/model';

import { prepareMembershipPayload } from '~/group/utils';
import { inferIsDeleted } from '~/utils/inferIsDeleted';
import { LinkedObject } from '~/utils/linkedObject';

/**
 * ```js
 * import { queryPosts } from '@amityco/ts-sdk'
 * const { data: posts, prevPage, nextPage } = await queryPosts({ targetId, targetType })
 * ```
 *
 * Queries a paginable list of {@link Amity.Post} objects
 *
 * @param query The query parameters
 * @returns posts
 *
 * @category Post API
 * @async
 */
export const queryPosts = async (
  query: Amity.QueryPosts,
): Promise<Amity.Cached<Amity.PageToken<Amity.Post>>> => {
  const client = getActiveClient();
  client.log('post/queryPosts', query);

  const { page, limit = 10, includeDeleted, ...params } = query;
  const { dataTypes, matchingOnlyParentPost } = params;

  const options = (() => {
    if (page) return { token: page };
    if (limit) return { limit };

    return undefined;
  })();

  // API-FIX: parameters should be querystring. (1)
  // API-FIX: backend should answer Amity.Response (2)
  // const { data } = await client.http.get<Amity.Response<Amity.PagedResponse<Amity.PostPayload>>>(
  const { data } = await client.http.get<Amity.PostPayload & Amity.Pagination>(`/api/v4/posts`, {
    params: {
      ...params,
      isDeleted: inferIsDeleted(includeDeleted),
      /*
       * when creating post like image, file, video BE will create 2 posts
       * 1. parent post to store text with dataType=text
       * 2. child post to store dataTypes post data
       *
       * By default, BE queries only parent post
       */
      matchingOnlyParentPost: matchingOnlyParentPost ?? !dataTypes?.length,
      options,
    },
  });

  // API-FIX: backend should answer Amity.Response (2)
  // const { paging, posts } = unwrapPayload(data)
  // unpacking
  const { paging, ...payload } = data;
  const paperedPayload = prepareMembershipPayload(payload, 'communityUsers');
  const { posts } = payload;

  const cachedAt = client.cache && Date.now();

  if (client.cache) {
    ingestInCache(paperedPayload, { cachedAt });

    const cacheKey = ['post', 'query', { ...params, options } as Amity.Serializable];
    pushToCache(cacheKey, { posts: posts.map(getResolver('post')), paging });
  }

  return { data: posts.map(LinkedObject.post), cachedAt, paging };
};
