import { getActiveClient } from '~/client/api';

import { pullFromCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { checkIfShouldGoesToTombstone } from '~/cache/utils';
import { pushToTombstone } from '~/cache/api/pushToTombstone';

export const getCommentByIds = async (
  commentIds: Amity.InternalComment['commentId'][],
): Promise<Amity.Cached<Amity.InternalComment[]>> => {
  const client = getActiveClient();
  client.log('comment/getCommentByIds', commentIds);

  const encodedCommentIds = commentIds.map(commentId => encodeURIComponent(commentId));

  let data: Amity.CommentPayload;

  try {
    // API-FIX: endpoint should not be /list, parameters should be querystring.
    const response = await client.http.get<Amity.CommentPayload>(`/api/v3/comments/list`, {
      params: { commentIds: encodedCommentIds },
    });

    data = response.data;
  } catch (error) {
    commentIds.forEach(commentId => {
      if (checkIfShouldGoesToTombstone((error as Amity.ErrorResponse)?.code)) {
        pushToTombstone('comment', commentId);
      }
    });

    throw error;
  }

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(data, { cachedAt });

  return {
    data: data.comments,
    cachedAt,
  };
};

getCommentByIds.locally = (
  commentIds: Amity.InternalComment['commentId'][],
): Amity.Cached<Amity.InternalComment[]> | undefined => {
  const client = getActiveClient();
  client.log('comment/getCommentByIds.locally', commentIds);

  if (!client.cache) return;

  const cached = commentIds
    .map(commentId => pullFromCache<Amity.InternalComment>(['comment', 'get', commentId])!)
    .filter(Boolean);

  const comments = cached.map(({ data }) => data);
  const oldest = cached.sort((a, b) => (a.cachedAt! < b.cachedAt! ? -1 : 1))?.[0];

  if (cached?.length < commentIds.length) return;

  return {
    data: comments,
    cachedAt: oldest.cachedAt,
  };
};
