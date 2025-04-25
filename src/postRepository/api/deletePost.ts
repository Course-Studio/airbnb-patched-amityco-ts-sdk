import { getActiveClient } from '~/client/api';

import { fireEvent } from '~/core/events';
import { queryCache, upsertInCache } from '~/cache/api';
import { getCommunity } from '~/communityRepository/api/getCommunity';
import { pushToTombstone } from '~/cache/api/pushToTombstone';

import { LinkedObject } from '~/utils/linkedObject';
import { getPost } from './getPost';

/**
 * ```js
 * import { deletePost } from '@amityco/ts-sdk'
 * const success = await deletePost('foobar')
 * ```
 *
 * Deletes a {@link Amity.Post}
 *
 * @param postId The {@link Amity.Post} ID to delete
 * @return A success boolean if the {@link Amity.Post} was deleted
 *
 * @private
 * @async
 */
export const deletePost = async (
  postId: Amity.Post['postId'],
  permanent = false,
): Promise<Amity.Post> => {
  const client = getActiveClient();

  const post = await getPost(postId);

  await client.http.delete<{ success: boolean }>(`/api/v4/posts/${encodeURIComponent(postId)}`, {
    params: {
      postId,
      permanent,
    },
  });

  // there is currently a limitation which doesn't allow us to fire event to tell that community
  // has been updated. reason is that, when the object is deleted, we don't have its `communityId`
  // and so we cannot refetch the community or advertise on events. hopefully this should be solved
  // later when realtime events covers that for us.
  if (post.data.targetType === 'community') {
    const community = await getCommunity(post.data.targetId);

    const communityUsersCache =
      queryCache<Amity.RawMembership<'community'>>(['communityUsers', 'get']) ?? [];

    const communityUsers = communityUsersCache
      .filter(({ key }) => {
        // cache key is ['communityUsers', 'get', `${communityId}#`${userId}`}]
        if (key[0] !== 'communityUsers') return false;
        if (key[1] !== 'get') return false;

        if (typeof key[2] === 'string') return key[2].includes(community.data.communityId);
        return false;
      })
      .map(({ data }) => data);

    fireEvent('community.updated', {
      communities: [community.data],
      categories: [],
      communityUsers,
      feeds: [],
      files: [],
      users: [],
    });
  }

  // to support hard deletion
  const deleted = { ...post.data, isDeleted: true };

  if (permanent) {
    setTimeout(() => {
      pushToTombstone('post', postId);
    }, 0);
  } else {
    upsertInCache(['post', 'get', postId], { isDeleted: true });
  }

  fireEvent('local.post.deleted', {
    posts: [deleted],
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

  return LinkedObject.post(deleted);
};
