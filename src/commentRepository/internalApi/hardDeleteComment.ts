import { getActiveClient } from '~/client/api';

import { deleteComment } from './deleteComment';

export const hardDeleteComment = async (
  commentId: Amity.InternalComment['commentId'],
): Promise<Amity.InternalComment> => {
  const client = getActiveClient();
  client.log('comment/hardDeleteComment', commentId);

  const hardDeleted = deleteComment(commentId, true);

  return hardDeleted;
};
