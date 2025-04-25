import { getActiveClient } from '~/client/api/activeClient';

import { ingestInCache } from '~/cache/api/ingestInCache';

import { fireEvent } from '~/core/events';
import { prepareMembershipPayload } from '~/group/utils';

/* begin_public_function
  id: post.unflag
*/
/**
 * ```js
 * import { PostRepository } from '@amityco/ts-sdk'
 * const unflagged = await PostRepository.unflagPost(postId)
 * ```
 *
 * @param postId of the post to unflag
 * @returns the unflag post result
 *
 * @category Post API
 * @async
 * */
export const unflagPost = async (postId: Amity.Post['postId']): Promise<boolean> => {
  const client = getActiveClient();
  client.log('post/unflagPost', postId);

  const { data: payload } = await client.http.delete<Amity.PostPayload>(
    `/api/v3/posts/${encodeURIComponent(postId)}/unflag`,
  );

  if (client.cache) {
    ingestInCache(prepareMembershipPayload(payload, 'communityUsers'));
  }

  fireEvent('post.unflagged', payload);

  return !!payload;
};
/* end_public_function */
