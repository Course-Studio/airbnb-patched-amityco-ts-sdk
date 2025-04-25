import { getActiveClient } from '~/client/api';

import { ingestInCache } from '~/cache/api/ingestInCache';
import { fireEvent } from '~/core/events';
import { prepareMembershipPayload } from '~/group/utils';
import { LinkedObject } from '~/utils/linkedObject';

/* begin_public_function
  id: post.edit, post.edit.custom_post
*/
/**
 * ```js
 * import { PostRepository } from '@amityco/ts-sdk'
 * const updated = await PostRepository.editPost(postId, {
 *   data: { text: 'hello world' }
 * })
 * ```
 *
 * Updates an {@link Amity.Post}
 *
 * @param postId The ID of the {@link Amity.Post} to edit
 * @param patch The patch data to apply
 * @returns the updated {@link Amity.Post} object
 *
 * @category Post API
 * @async
 */
export const editPost = async <T extends Amity.PostContentType>(
  postId: Amity.Post['postId'],
  patch: Patch<Amity.Post, 'data' | 'metadata' | 'mentionees' | 'tags'> & {
    attachments?: {
      type: T;
      fileId: Amity.File['fileId'];
    }[];
  },
): Promise<Amity.Cached<Amity.Post>> => {
  const client = getActiveClient();
  client.log('user/editPost', patch);

  const { data: payload } = await client.http.put<Amity.PostPayload>(
    `/api/v4/posts/${encodeURIComponent(postId)}`,
    patch,
  );

  const data = prepareMembershipPayload(payload, 'communityUsers');

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(data, { cachedAt });

  fireEvent('local.post.updated', data);

  const { posts } = data;

  return {
    data: LinkedObject.post(posts.find(post => post.postId === postId)!),
    cachedAt,
  };
};
/* end_public_function */
