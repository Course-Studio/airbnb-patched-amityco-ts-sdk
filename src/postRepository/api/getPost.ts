import { getActiveClient } from '~/client/api';

import { pullFromCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { isInTombstone } from '~/cache/api/isInTombstone';
import { checkIfShouldGoesToTombstone } from '~/cache/utils';
import { pushToTombstone } from '~/cache/api/pushToTombstone';
import { prepareMembershipPayload } from '~/group/utils';
import { LinkedObject } from '~/utils/linkedObject';

/**
 * ```js
 * import { getPost } from '@amityco/ts-sdk'
 * const { data: post } = await getPost('foobar')
 * ```
 *
 * Fetches a {@link Amity.Post} object
 *
 * @param postId the ID of the {@link Amity.Post} to fetch
 * @returns the associated {@link Amity.Post} object
 *
 * @category Post API
 * @async
 */
export const getPost = async (postId: Amity.Post['postId']): Promise<Amity.Cached<Amity.Post>> => {
  const client = getActiveClient();
  client.log('post/getPost', postId);

  isInTombstone('post', postId);

  let payload: Amity.PostPayload;

  try {
    // API-FIX: endpoint should not be /list, parameters should be querystring.
    const response = await client.http.get<Amity.PostPayload>(
      `/api/v3/posts/${encodeURIComponent(postId)}`,
    );
    payload = response.data;
  } catch (error) {
    if (checkIfShouldGoesToTombstone((error as Amity.ErrorResponse)?.code)) {
      pushToTombstone('post', postId);
    }

    throw error;
  }

  const data = prepareMembershipPayload(payload, 'communityUsers');

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(data, { cachedAt });

  const { posts } = data;

  const result = posts.find(post => post.postId === postId)!;

  return {
    data: LinkedObject.post(result),
    cachedAt,
  };
};

/**
 * ```js
 * import { getPost } from '@amityco/ts-sdk'
 * const { data: post } = getPost.locally('foobar')
 * ```
 *
 * Fetches a {@link Amity.Post} object from cache
 *
 * @param postId the ID of the {@link Amity.Post} to fetch
 * @returns the associated {@link Amity.Post} object
 *
 * @category Post API
 */
getPost.locally = (postId: Amity.Post['postId']): Amity.Cached<Amity.Post> | undefined => {
  const client = getActiveClient();
  client.log('post/getPost.locally', postId);

  if (!client.cache) return;

  const cached = pullFromCache<Amity.InternalPost>(['post', 'get', postId]);

  if (!cached) return;

  return {
    data: LinkedObject.post(cached.data),
    cachedAt: cached.cachedAt,
  };
};
