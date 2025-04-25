import { getActiveClient } from '~/client/api';

import { pullFromCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { isInTombstone } from '~/cache/api/isInTombstone';
import { checkIfShouldGoesToTombstone } from '~/cache/utils';
import { pushToTombstone } from '~/cache/api/pushToTombstone';

export const getComment = async (
  commentId: Amity.InternalComment['commentId'],
): Promise<Amity.Cached<Amity.InternalComment>> => {
  const client = getActiveClient();
  client.log('comment/getComment', commentId);

  isInTombstone('comment', commentId);

  let data: Amity.CommentPayload;

  try {
    // API-FIX: endpoint should not be /list, parameters should be querystring.
    const response = await client.http.get<Amity.CommentPayload>(
      `/api/v3/comments/${encodeURIComponent(commentId)}`,
    );

    data = response.data;
  } catch (error) {
    if (checkIfShouldGoesToTombstone((error as Amity.ErrorResponse)?.code)) {
      pushToTombstone('comment', commentId);
    }

    throw error;
  }

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(data, { cachedAt });

  const { comments } = data;
  return {
    data: comments.find(comment => comment.commentId === commentId)!,
    cachedAt,
  };
};

getComment.locally = (
  commentId: Amity.InternalComment['commentId'],
): Amity.Cached<Amity.InternalComment> | undefined => {
  const client = getActiveClient();
  client.log('comment/getComment.locally', commentId);

  if (!client.cache) return;

  const cached = pullFromCache<Amity.InternalComment>(['comment', 'get', commentId]);

  if (!cached) return;

  return {
    data: cached.data,
    cachedAt: cached.cachedAt,
  };
};
