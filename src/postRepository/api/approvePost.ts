import { getActiveClient } from '~/client/api';

import { ingestInCache } from '~/cache/api/ingestInCache';
import { fireEvent } from '~/core/events';
import { prepareMembershipPayload } from '~/group/utils';
import { LinkedObject } from '~/utils/linkedObject';

/* begin_public_function
  id: post.approve
*/
/**
 * ```js
 * import { approvePost } from '@amityco/ts-sdk'
 *
 * const { data: post } = await approvePost('postId')
 * ```
 *
 * Approves a {@link Amity.Post}
 *
 * @param postId The {@link Amity.Post} ID to be approved
 * @return A {@link Amity.Post} that was approved
 *
 * @category Post API
 * @async
 */
export const approvePost = async (
  postId: Amity.Post['postId'],
): Promise<Amity.Cached<Amity.Post>> => {
  const client = getActiveClient();
  client.log('post/approvePost', postId);

  const { data: payload } = await client.http.post<Amity.PostPayload>(
    `/api/v3/posts/${encodeURIComponent(postId)}/approve`,
  );

  fireEvent('post.approved', payload);

  // fire virtual event for community update
  if (payload.posts[0].targetType === 'community') {
    fireEvent('community.updated', payload);
  }

  const data = prepareMembershipPayload(payload, 'communityUsers');
  const cachedAt = client.cache && Date.now();

  if (client.cache) ingestInCache(data, { cachedAt });

  return {
    data: LinkedObject.post(data.posts.find(post => post.postId === postId)!),
    cachedAt,
  };
};
/* end_public_function */
