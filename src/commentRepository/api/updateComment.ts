import { getActiveClient } from '~/client/api';

import { ingestInCache } from '~/cache/api/ingestInCache';
import { fireEvent } from '~/core/events';
import { LinkedObject } from '~/utils/linkedObject';

/* begin_public_function
  id: comment.update_comment
*/
/**
 * ```js
 * import { CommentRepository } from '@amityco/ts-sdk'
 * const updated = await CommentRepository.updateComment(commentId, {
 *   data: { text: 'hello world' }
 * })
 * ```
 *
 * Updates an {@link Amity.Comment}
 *
 * @param commentId The ID of the {@link Amity.Comment} to edit
 * @param patch The patch data to apply
 * @returns the updated {@link Amity.Comment} object
 *
 * @category Comment API
 * @async
 */
export const updateComment = async (
  commentId: Amity.Comment['commentId'],
  patch: Patch<Amity.Comment, 'data' | 'metadata' | 'mentionees'>,
): Promise<Amity.Cached<Amity.Comment>> => {
  const client = getActiveClient();
  client.log('user/updateComment', patch);

  const { data } = await client.http.put<Amity.CommentPayload>(
    `/api/v3/comments/${encodeURIComponent(commentId)}`,
    patch,
  );

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(data, { cachedAt });

  fireEvent('comment.updated', data);

  const { comments } = data;
  return {
    data: LinkedObject.comment(comments.find(comment => comment.commentId === commentId)!),
    cachedAt,
  };
};
/* end_public_function */
