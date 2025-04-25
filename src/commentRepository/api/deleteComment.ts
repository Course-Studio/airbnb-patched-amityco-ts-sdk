import { getActiveClient } from '~/client/api';

import { upsertInCache } from '~/cache/api';
import { fireEvent } from '~/core/events';

import { pushToTombstone } from '~/cache/api/pushToTombstone';
import { scheduleTask } from '~/core/microtasks';

import { getStoryByStoryId } from '~/storyRepository/internalApi/getStoryByStoryId';
import { getComment } from './getComment';
import { pullFromCache } from '~/cache/api/pullFromCache';

/* begin_public_function
  id: comment.soft_delete, comment.hard_delete
*/
/**
 * ```js
 * import { CommentRepository } from '@amityco/ts-sdk'
 * const success = await CommentRepository.deleteComment('foobar')
 * ```
 *
 * Deletes a {@link Amity.Comment}
 *
 * @param commentId The {@link Amity.Comment} ID to delete
 * @return A success boolean if the {@link Amity.Comment} was deleted
 *
 * @category Comment API
 * @async
 */
export const deleteComment = async (
  commentId: Amity.Comment['commentId'],
  permanent = false,
): Promise<Amity.Comment> => {
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

  if (comment.data.referenceType === 'story') {
    const story = await getStoryByStoryId(comment.data.referenceId);

    fireEvent('local.story.updated', {
      stories: [story.data],
      categories: [],
      comments: [],
      communities: [],
      communityUsers: [],
      files: [],
      users: [],
    });
  } else {
    const post = pullFromCache<Amity.Post>(['post', 'get', comment.data.referenceId])?.data;

    if (post) {
      let removeCount: number;
      if (!deleted.parentId) {
        // NOTE: delete the parent comment will remove all children comments
        removeCount = deleted.childrenNumber + 1;
      } else removeCount = 1;

      post.commentsCount -= removeCount;

      fireEvent('local.post.updated', {
        posts: [post],
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
    }
  }

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
/* end_public_function */
