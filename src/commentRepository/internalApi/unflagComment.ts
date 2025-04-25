import { getActiveClient } from '~/client/api/activeClient';

import { ingestInCache } from '~/cache/api/ingestInCache';

import { fireEvent } from '~/core/events';

export const unflagComment = async (
  commentId: Amity.InternalComment['commentId'],
): Promise<boolean> => {
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
