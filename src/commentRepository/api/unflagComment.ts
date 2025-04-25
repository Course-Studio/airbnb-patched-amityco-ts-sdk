import { getActiveClient } from '~/client/api/activeClient';

import { ingestInCache } from '~/cache/api/ingestInCache';

import { fireEvent } from '~/core/events';

/* begin_public_function
  id: comment.unflag
*/
/**
 * ```js
 * import { CommentRepository } from '@amityco/ts-sdk'
 * const unflagged = await CommentRepository.unflagComment('commentId')
 * ```
 *
 * @param commentId The ID of comment to unflag
 * @returns the unflagged result
 *
 * @category Comment API
 * @async
 * */
export const unflagComment = async (commentId: Amity.Comment['commentId']): Promise<boolean> => {
  const client = getActiveClient();
  client.log('comment/unflagComment', commentId);

  const { data: payload } = await client.http.delete<Amity.CommentPayload>(
    `/api/v3/comments/${encodeURIComponent(commentId)}/unflag`,
  );

  if (client.cache) {
    ingestInCache(payload);
  }

  fireEvent('comment.unflagged', payload);

  return !!payload;
};
/* end_public_function */
