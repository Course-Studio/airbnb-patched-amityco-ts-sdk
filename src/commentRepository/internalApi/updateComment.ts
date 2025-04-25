import { getActiveClient } from '~/client/api';

import { ingestInCache } from '~/cache/api/ingestInCache';
import { fireEvent } from '~/core/events';

export const updateComment = async (
  commentId: Amity.InternalComment['commentId'],
  patch: Patch<Amity.InternalComment, 'data' | 'metadata' | 'mentionees'>,
): Promise<Amity.Cached<Amity.InternalComment>> => {
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
    data: comments.find(comment => comment.commentId === commentId)!,
    cachedAt,
  };
};
