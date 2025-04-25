import { getActiveClient } from '~/client/api';

import { LinkedObject } from '~/utils/linkedObject';
import { deletePost } from './deletePost';

/* begin_public_function
  id: post.hard_delete
*/
/**
 * ```js
 * import { hardDeletePost } from '@amityco/ts-sdk'
 * const success = await hardDeletePost('foobar')
 * ```
 *
 * Hard deletes a {@link Amity.Post}
 *
 * @param postId The {@link Amity.Post} ID to be hard delete
 * @return A success boolean if the {@link Amity.Post} was deleted
 *
 * @category Post API
 * @async
 */
export const hardDeletePost = async (postId: Amity.Post['postId']): Promise<Amity.Post> => {
  const client = getActiveClient();
  client.log('post/hardDeletePost', postId);

  const hardDeleted = await deletePost(postId, true);

  return LinkedObject.post(hardDeleted);
};
/* end_public_function */
