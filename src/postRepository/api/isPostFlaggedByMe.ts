import { getActiveClient } from '~/client/api/activeClient';

/* begin_public_function
  id: post.check_flag_by_me
*/
/**
 * ```js
 * import { PostRepository } from '@amityco/ts-sdk'
 * const isReported = await PostRepository.isPostFlaggedByMe('post', postId)
 * ```
 *
 * @param postId of the post to check if flagged by current user
 * @returns `true` if the post is flagged by me, `false` if doesn't.
 *
 * @category Post API
 * @async
 * */
export const isPostFlaggedByMe = async (postId: Amity.Post['postId']): Promise<boolean> => {
  const client = getActiveClient();
  client.log('post/isPostFlaggedByMe', postId);

  const {
    data: { result },
  } = await client.http.get(`/api/v3/posts/${postId}/isflagbyme`);

  return result;
};
/* end_public_function */
