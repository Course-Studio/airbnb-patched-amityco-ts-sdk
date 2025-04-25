import { getActiveClient } from '~/client/api';

import { ingestInCache } from '~/cache/api/ingestInCache';
import { fireEvent } from '~/core/events';

import { getPost } from '~/postRepository/api/getPost';
import { LinkedObject } from '~/utils/linkedObject';
import { pullFromCache } from '~/cache/api';
import { STORY_KEY_CACHE } from '~/storyRepository/constants';

/* begin_public_function
  id: comment.create
*/
/**
 * ```js
 * import { CommentRepository } from '@amityco/ts-sdk'
 * const newComment = await CommentRepository.createComment(bundle)
 * ```
 *
 * Creates an {@link Amity.Comment}
 *
 * @param bundle The data necessary to create a new {@link Amity.Comment}
 * @returns The newly created {@link Amity.Comment}
 *
 * @category Comment API
 * @async
 */
export const createComment = async (
  bundle: Pick<
    Amity.Comment<Amity.CommentContentType>,
    | 'data'
    | 'referenceType'
    | 'referenceId'
    | 'parentId'
    | 'metadata'
    | 'mentionees'
    | 'attachments'
  >,
): Promise<Amity.Cached<Amity.Comment>> => {
  const client = getActiveClient();
  client.log('comment/createComment', bundle);

  const { data } = await client.http.post<Amity.CommentPayload>('/api/v3/comments', bundle);

  const { comments } = data;

  // BE always returns an array of comments If it got record 0 from BE it might have a problem on creation logic
  if (comments.length === 0) throw new Error('Comment not created');

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(data, { cachedAt });

  if (['post', 'content'].includes(bundle.referenceType)) {
    const post = pullFromCache<Amity.Post>(['post', 'get', bundle.referenceId])?.data;

    if (post) {
      post.commentsCount += 1;

      fireEvent('local.post.updated', {
        posts: [post],
        categories: [],
        comments: [],
        communities: [],
        communityUsers: data.communityUsers,
        feeds: [],
        files: data.files,
        postChildren: [],
        users: data.users,
        videoStreamings: [],
      });
    }
  } else if (bundle.referenceType === 'story') {
    const storyIndex = pullFromCache<Amity.Story['referenceId']>([
      STORY_KEY_CACHE.STORY_ID_TO_REFERENCE_ID,
      bundle.referenceId,
    ]);

    if (storyIndex?.data) {
      const cacheStory = pullFromCache<Amity.InternalStory>([
        STORY_KEY_CACHE.STORY,
        'get',
        storyIndex.data,
      ]);

      if (cacheStory?.data) {
        fireEvent('story.updated', {
          stories: [
            {
              ...cacheStory.data,
              commentsCount: cacheStory.data.commentsCount + 1,
              comments: [...new Set([...cacheStory.data.comments, comments[0].commentId])],
            },
          ],
          categories: [],
          comments,
          communities: [],
          communityUsers: data.communityUsers,
          files: data.files,
          users: data.users,
        });
      }
    }
  }

  fireEvent('local.comment.created', data);

  return {
    data: LinkedObject.comment(comments[0]),
    cachedAt,
  };
};
/* end_public_function */
