import { getActiveClient } from '~/client/api/activeClient';

export const isCommentFlaggedByMe = async (
  commentId: Amity.InternalComment['commentId'],
): Promise<boolean> => {
  const client = getActiveClient();
  client.log('comment/isCommentFlaggedByMe', commentId);

  const {
    data: { result },
  } = await client.http.get(`/api/v3/comments/${commentId}/isflagbyme`);

  return result;
};
