import { getActiveClient } from '~/client/api';

import { ingestInCache } from '~/cache/api/ingestInCache';
import { fireEvent } from '~/core/events';
import { prepareMembershipPayload } from '~/group/utils';
import { LinkedObject } from '~/utils/linkedObject';

/* begin_public_function
  id: post.decline
*/
/**
 * ```js
 * import { declinePost } from '@amityco/ts-sdk'
 *
 * const {data: post} = await declinePost('postId')
 * ```
 *
 * Declines a {@link Amity.Post}
 *
 * @param postId The {@link Amity.Post} ID to be declined
 * @return A {@link Amity.Post} that was declined
 *
 * @category Post API
 * @async
 */
export const declinePost = async (
  postId: Amity.Post['postId'],
): Promise<Amity.Cached<Amity.Post>> => {
  const client = getActiveClient();
  client.log('post/declinePost', postId);

  const { data: payload } = await client.http.post<Amity.PostPayload>(
    `/api/v3/posts/${encodeURIComponent(postId)}/decline`,
  );

  // fire virtual event
  if (payload.posts[0].targetType === 'community') {
    fireEvent('community.updated', payload);
  }

  fireEvent('post.declined', payload);

  const data = prepareMembershipPayload(payload, 'communityUsers');
  const cachedAt = client.cache && Date.now();

  if (client.cache) ingestInCache(data, { cachedAt });

  return {
    data: LinkedObject.post(payload.posts.find(post => post.postId === postId)!),
    cachedAt,
  };
};
/* end_public_function */
