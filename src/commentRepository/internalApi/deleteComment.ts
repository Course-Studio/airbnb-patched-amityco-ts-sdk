import { getActiveClient } from '~/client/api';

import { upsertInCache } from '~/cache/api';
import { fireEvent } from '~/core/events';

import { getPost } from '~/postRepository/api/getPost';
import { pushToTombstone } from '~/cache/api/pushToTombstone';
import { scheduleTask } from '~/core/microtasks';

import { getComment } from './getComment';

export const deleteComment = async (
  commentId: Amity.InternalComment['commentId'],
  permanent = false,
): Promise<Amity.InternalComment> => {
  const client = getActiveClient();

  const comment = await getComment(commentId);

  // API-FIX: This endpoint has not been implemented yet.
  await client.http.delete<{ success: boolean }>(
    `/api/v4/comments/${encodeURIComponent(commentId)}`,
    {
      params: {
        commentId,
        permanent,
      },
    },
  );

  // to support hard deletion
  const deleted = { ...comment.data, isDeleted: true };

  const post = await getPost(comment.data.referenceId);

  fireEvent('local.post.updated', {
    posts: [post.data],
    categories: [],
    comments: [],
    communities: [],
    communityUsers: [],
    feeds: [],
    files: [],
    postChildren: [],
    users: [],
    videoStreamings: [],
  });

  fireEvent('local.comment.deleted', {
    comments: [deleted],
    commentChildren: [],
    files: [],
    users: [],
    communityUsers: [],
  });

  if (permanent) {
    scheduleTask(() => pushToTombstone('comment', commentId));
  } else {
    upsertInCache(['comment', 'get', commentId], { isDeleted: true });
  }

  return deleted;
};
