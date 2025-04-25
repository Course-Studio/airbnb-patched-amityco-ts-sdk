import { getActiveClient } from '~/client/api/activeClient';

import { ingestInCache } from '~/cache/api/ingestInCache';
import { fireEvent } from '~/core/events';
import { prepareMembershipPayload } from '~/group/utils';

/* begin_public_function
  id: post.flag
*/
/**
 * ```js
 * import { PostRepository } from '@amityco/ts-sdk'
 * const flagged = await PostRepository.flagPost(postId)
 * ```
 *
 * @param postId of the post to flag
 * @returns a boolean
 *
 * @category Post API
 * @async
 * */
export const flagPost = async (postId: Amity.Post['postId']): Promise<boolean> => {
  const client = getActiveClient();
  client.log('post/flagPost', postId);

  const { data: payload } = await client.http.post<Amity.PostPayload>(
    `/api/v3/posts/${encodeURIComponent(postId)}/flag`,
  );

  if (client.cache) {
    ingestInCache(prepareMembershipPayload(payload, 'communityUsers'));
  }

  fireEvent('post.flagged', payload);

  return !!payload;
};
/* end_public_function */
