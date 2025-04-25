import { getActiveClient } from '~/client/api';

import { deleteComment } from './deleteComment';

/* begin_public_function
  id: comment.hard_delete
*/
/**
 * ```js
 * import { CommentRepository } from '@amityco/ts-sdk'
 * const success = await CommentRepository.hardDeleteComment('foobar')
 * ```
 *
 * Deletes a {@link Amity.Comment}
 *
 * @param commentId The {@link Amity.Comment} ID to delete
 * @return A success boolean if the {@link Amity.Comment} was deleted
 *
 * @category Comment API
 * @async
 */
export const hardDeleteComment = async (
  commentId: Amity.Comment['commentId'],
): Promise<Amity.Comment> => {
  const client = getActiveClient();
  client.log('comment/hardDeleteComment', commentId);

  const hardDeleted = deleteComment(commentId, true);

  return hardDeleted;
};
/* end_public_function */
