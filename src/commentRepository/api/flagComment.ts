import { getActiveClient } from '~/client/api/activeClient';

import { ingestInCache } from '~/cache/api/ingestInCache';
import { fireEvent } from '~/core/events';

/* begin_public_function
  id: comment.flag
*/
/**
 * ```js
 * import { CommentRepository } from '@amityco/ts-sdk'
 * const flagged = await CommentRepository.flagComment('commentId')
 * ```
 *
 * @param commentId The ID of the comment to flag
 * @returns the created report result
 *
 * @category Comment API
 * @async
 * */
export const flagComment = async (commentId: Amity.Comment['commentId']): Promise<boolean> => {
  const client = getActiveClient();
  client.log('comment/flagComment', commentId);

  const { data: payload } = await client.http.post<Amity.CommentPayload>(
    `/api/v3/comments/${encodeURIComponent(commentId)}/flag`,
  );

  if (client.cache) {
    ingestInCache(payload);
  }

  fireEvent('comment.flagged', payload);

  return !!payload;
};
/* end_public_function */
