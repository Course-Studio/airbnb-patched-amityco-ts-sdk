import { getActiveClient } from '~/client/api/activeClient';

/* begin_public_function
  id: comment.check_flag_by_me
*/
/**
 * ```js
 * import { CommentRepository } from '@amityco/ts-sdk'
 * const isReported = await CommentRepository.isCommentFlaggedByMe('commentId')
 * ```
 *
 * @param commentId The ID of the comment to check if flagged by current user
 * @returns `true` if the comment is flagged by me, `false` if doesn't.
 *
 * @category Comment API
 * @async
 * */
export const isCommentFlaggedByMe = async (
  commentId: Amity.Comment['commentId'],
): Promise<boolean> => {
  const client = getActiveClient();
  client.log('comment/isCommentFlaggedByMe', commentId);

  const {
    data: { result },
  } = await client.http.get(`/api/v3/comments/${commentId}/isflagbyme`);

  return result;
};
/* end_public_function */
