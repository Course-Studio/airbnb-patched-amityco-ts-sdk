import { getActiveClient } from '~/client/api';

import { ingestInCache } from '~/cache/api/ingestInCache';
import { fireEvent } from '~/core/events';
import { prepareMembershipPayload } from '~/group/utils';
import { LinkedObject } from '~/utils/linkedObject';

/* begin_public_function
  id: post.create.text_post, post.create.image_post, post.create.file_post, post.create.video_post, post.create.poll_post, post.create.livestream_post, post.create.custom_post
*/
/**
 * ```js
 * import { PostRepository } from '@amityco/ts-sdk'
 * const created = await PostRepository.createPost({
 *   targetType: 'user',
 *   targetId: 'foobar',
 *   data: { text: 'hello world' }
 * }))
 * ```
 *
 * Creates an {@link Amity.Post}
 *
 * @param bundle The data necessary to create a new {@link Amity.Post}
 * @returns The newly created {@link Amity.Post}
 *
 * @category Post API
 * @async
 */
export const createPost = async <T extends Amity.PostContentType | string>(
  bundle: Pick<Amity.Post<T>, 'targetType' | 'targetId'> &
    Partial<Pick<Amity.Post<T>, 'metadata' | 'mentionees' | 'tags'>> & {
      dataType?: T;
      data?: { [k: string]: any };
      attachments?: { type: T; fileId: Amity.File['fileId'] }[];
    },
): Promise<Amity.Cached<Amity.Post>> => {
  const client = getActiveClient();
  client.log('post/createPost', bundle);

  if (!bundle.dataType || ['text', 'image', 'file', 'video'].includes(bundle.dataType)) {
    // eslint-disable-next-line no-param-reassign
    delete bundle.dataType;
  }

  const { data: payload } = await client.http.post<Amity.PostPayload>('/api/v4/posts', bundle);

  fireEvent('post.created', payload);

  const data = prepareMembershipPayload(payload, 'communityUsers');
  const cachedAt = client.cache && Date.now();

  if (client.cache) ingestInCache(data, { cachedAt });

  const { posts } = data;

  return {
    data: LinkedObject.post(posts[0]),
    cachedAt,
  };
};
/* end_public_function */
