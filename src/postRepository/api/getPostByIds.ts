import { getActiveClient } from '~/client/api';

import { pullFromCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { prepareMembershipPayload } from '~/group/utils';
import { checkIfShouldGoesToTombstone } from '~/cache/utils';
import { pushToTombstone } from '~/cache/api/pushToTombstone';
import { LinkedObject } from '~/utils/linkedObject';

/* begin_public_function
  id: post.get_by_ids
*/
/**
 * ```js
 * import { getPostByIds } from '@amityco/ts-sdk'
 * const { data: posts } = await getPostByIds(['foo', 'bar'])
 * ```
 *
 * Fetches a collection of {@link Amity.Post} objects
 *
 * @param postIds the IDs of the {@link Amity.Post} to fetch
 * @returns the associated collection of {@link Amity.Post} objects
 *
 * @category Post API
 * @async
 */
export const getPostByIds = async (
  postIds: Amity.Post['postId'][],
): Promise<Amity.Cached<Amity.Post[]>> => {
  const client = getActiveClient();
  client.log('post/getPostByIds', postIds);

  const encodedPostIds = postIds.map(postId => encodeURIComponent(postId));

  let payload: Amity.PostPayload;

  try {
    // API-FIX: endpoint should not be /list, parameters should be querystring.
    const response = await client.http.get<Amity.PostPayload>(`/api/v3/posts/list`, {
      params: { postIds: encodedPostIds },
    });

    payload = response.data;
  } catch (error) {
    postIds.forEach(postId => {
      if (checkIfShouldGoesToTombstone((error as Amity.ErrorResponse)?.code)) {
        pushToTombstone('post', postId);
      }
    });

    throw error;
  }

  const data = prepareMembershipPayload(payload, 'communityUsers');

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(data, { cachedAt });

  return {
    data: data.posts.map(LinkedObject.post),
    cachedAt,
  };
};
/* end_public_function */

/**
 * ```js
 * import { getPostByIds } from '@amityco/ts-sdk'
 * const { data: posts } = getPostByIds.locally(['foo', 'bar'])
 * ```
 *
 * Fetches a collection of {@link Amity.Post} objects from cache
 *
 * @param postIds the IDs of the {@link Amity.Post} to fetch
 * @returns the associated collection of {@link Amity.Post} objects
 *
 * @category Post API
 */

getPostByIds.locally = (
  postIds: Amity.Post['postId'][],
): Amity.Cached<Amity.Post[]> | undefined => {
  const client = getActiveClient();
  client.log('post/getPostByIds.locally', postIds);

  if (!client.cache) return;

  const cached = postIds
    .map(postId => pullFromCache<Amity.InternalPost>(['post', 'get', postId])!)
    .filter(Boolean);

  const posts = cached.map(({ data }) => data);
  const oldest = cached.sort((a, b) => (a.cachedAt! < b.cachedAt! ? -1 : 1))?.[0];

  if (cached?.length < postIds.length) return;

  return {
    data: posts.map(LinkedObject.post),
    cachedAt: oldest.cachedAt,
  };
};
