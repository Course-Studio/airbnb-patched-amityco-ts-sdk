import { getActiveClient } from '~/client/api/activeClient';

import { ingestInCache } from '~/cache/api/ingestInCache';
import { fireEvent } from '~/core/events';

export const flagComment = async (
  commentId: Amity.InternalComment['commentId'],
): Promise<boolean> => {
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
