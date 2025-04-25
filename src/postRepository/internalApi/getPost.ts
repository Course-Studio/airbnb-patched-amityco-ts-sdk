import { getActiveClient } from '~/client/api';

import { pullFromCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { isInTombstone } from '~/cache/api/isInTombstone';
import { checkIfShouldGoesToTombstone } from '~/cache/utils';
import { pushToTombstone } from '~/cache/api/pushToTombstone';
import { prepareMembershipPayload } from '~/group/utils';

export const getPost = async (
  postId: Amity.InternalPost['postId'],
): Promise<Amity.Cached<Amity.InternalPost>> => {
  const client = getActiveClient();
  client.log('post/getPost', postId);

  isInTombstone('post', postId);

  let payload: Amity.PostPayload;

  try {
    // API-FIX: endpoint should not be /list, parameters should be querystring.
    const response = await client.http.get<Amity.PostPayload>(
      `/api/v3/posts/${encodeURIComponent(postId)}`,
    );
    payload = response.data;
  } catch (error) {
    if (checkIfShouldGoesToTombstone((error as Amity.ErrorResponse)?.code)) {
      pushToTombstone('post', postId);
    }

    throw error;
  }

  const data = prepareMembershipPayload(payload, 'communityUsers');

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(data, { cachedAt });

  const { posts } = data;

  const result = posts.find(post => post.postId === postId)!;

  return {
    data: result,
    cachedAt,
  };
};

getPost.locally = (
  postId: Amity.InternalPost['postId'],
): Amity.Cached<Amity.InternalPost> | undefined => {
  const client = getActiveClient();
  client.log('post/getPost.locally', postId);

  if (!client.cache) return;

  const cached = pullFromCache<Amity.InternalPost>(['post', 'get', postId]);

  if (!cached) return;

  return {
    data: cached.data,
    cachedAt: cached.cachedAt,
  };
};
