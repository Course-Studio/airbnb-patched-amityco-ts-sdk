import { getActiveClient } from '~/client/api';

import { deleteComment } from './deleteComment';

export const softDeleteComment = async (
  commentId: Amity.InternalComment['commentId'],
): Promise<Amity.InternalComment> => {
  const client = getActiveClient();
  client.log('comment/softDeleteComment', commentId);

  const softDeleted = deleteComment(commentId);

  return softDeleted;
};
