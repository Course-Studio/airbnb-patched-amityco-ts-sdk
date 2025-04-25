import { getActiveClient } from '~/client/api';

import { ingestInCache } from '~/cache/api/ingestInCache';
import { fireEvent } from '~/core/events';

import { getPost } from '~/postRepository/api/getPost';

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
): Promise<Amity.Cached<Amity.InternalComment>> => {
  const client = getActiveClient();
  client.log('comment/createComment', bundle);

  const { data } = await client.http.post<Amity.CommentPayload>('/api/v3/comments', bundle);

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(data, { cachedAt });

  const post = await getPost(bundle.referenceId);

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

  fireEvent('local.comment.created', data);

  const { comments } = data;
  return {
    data: comments[0],
    cachedAt,
  };
};
