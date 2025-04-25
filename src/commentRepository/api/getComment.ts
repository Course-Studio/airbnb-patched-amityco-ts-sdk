import { getActiveClient } from '~/client/api';

import { pullFromCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { isInTombstone } from '~/cache/api/isInTombstone';
import { checkIfShouldGoesToTombstone } from '~/cache/utils';
import { pushToTombstone } from '~/cache/api/pushToTombstone';
import { LinkedObject } from '~/utils/linkedObject';

/**
 * ```js
 * import { CommentRepository } from '@amityco/ts-sdk'
 * const comment = await CommentRepository.getComment('foobar')
 * ```
 *
 * Fetches a {@link Amity.Comment} object
 *
 * @param commentId the ID of the {@link Amity.Comment} to fetch
 * @returns the associated {@link Amity.Comment} object
 *
 * @category Comment API
 * @async
 */
export const getComment = async (
  commentId: Amity.Comment['commentId'],
): Promise<Amity.Cached<Amity.Comment>> => {
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
    data: LinkedObject.comment(comments.find(comment => comment.commentId === commentId)!),
    cachedAt,
  };
};

/**
 * ```js
 * import { getComment } from '@amityco/ts-sdk'
 * const comment = getComment.locally('foobar')
 * ```
 *
 * Fetches a {@link Amity.Comment} object
 *
 * @param commentId the ID of the {@link Amity.Comment} to fetch
 * @returns the associated {@link Amity.Comment} object
 *
 * @category Comment API
 */
getComment.locally = (
  commentId: Amity.Comment['commentId'],
): Amity.Cached<Amity.Comment> | undefined => {
  const client = getActiveClient();
  client.log('comment/getComment.locally', commentId);

  if (!client.cache) return;

  const cached = pullFromCache<Amity.InternalComment>(['comment', 'get', commentId]);

  if (!cached) return;

  return {
    data: LinkedObject.comment(cached.data),
    cachedAt: cached.cachedAt,
  };
};
