import { getActiveClient } from '~/client/api';

import { LinkedObject } from '~/utils/linkedObject';
import { deletePost } from './deletePost';

/* begin_public_function
  id: post.soft_delete
*/
/**
 * ```js
 * import { PostRepository } from '@amityco/ts-sdk'
 * const success = await PostRepository.softDeletePost('foobar')
 * ```
 *
 * Soft deletes a {@link Amity.Post}
 *
 * @param postId The {@link Amity.Post} ID to soft delete
 * @return A success boolean if the {@link Amity.Post} was deleted
 *
 * @category Post API
 * @async
 */
export const softDeletePost = async (postId: Amity.Post['postId']): Promise<Amity.Post> => {
  const client = getActiveClient();
  client.log('post/softDeletePost', postId);

  const softDeleted = await deletePost(postId, false);

  return LinkedObject.post(softDeleted);
};
/* end_public_function */
