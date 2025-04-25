import { getActiveClient } from '~/client/api/activeClient';

import { ingestInCache } from '~/cache/api/ingestInCache';

import { fireEvent } from '~/core/events';
import { prepareMessagePayload } from '~/messageRepository/utils';
import { preparePostPayload } from '~/postRepository/utils/payload';
import { prepareUserPayload } from '~/userRepository/utils/prepareUserPayload';
import { prepareCommentPayload } from '~/commentRepository/utils/payload';

const deleteMessageReport = async ({
  client,
  referenceId,
}: {
  client: Amity.Client;
  referenceId: string;
}) => {
  const { data: payload } = await client.http.delete<Amity.MessagePayload>(
    `/api/v5/messages/${encodeURIComponent(referenceId)}/flags`,
  );

  if (client.cache) {
    const messagePayload = await prepareMessagePayload(payload as Amity.MessagePayload);
    ingestInCache(messagePayload);
  }

  fireEvent(`message.unflagged`, payload);

  return !!payload;
};

const deletePostReport = async ({
  client,
  referenceId,
}: {
  client: Amity.Client;
  referenceId: string;
}) => {
  const { data: payload } = await client.http.delete<Amity.PostPayload>(
    `/api/v3/posts/${encodeURIComponent(referenceId)}/unflag`,
  );

  if (client.cache) {
    const postPayload = await preparePostPayload(payload);
    ingestInCache(postPayload);
  }

  fireEvent(`post.unflagged`, payload);

  return !!payload;
};

const deleteUserReport = async ({
  client,
  referenceId,
}: {
  client: Amity.Client;
  referenceId: string;
}) => {
  const { data: payload } = await client.http.delete<Amity.UserPayload>(
    `/api/v4/me/flags/${encodeURIComponent(referenceId)}`,
  );

  if (client.cache) {
    const userPayload = await prepareUserPayload(payload);
    ingestInCache(userPayload);
  }

  fireEvent(`user.unflagged`, payload);

  return !!payload;
};

const deleteCommentReport = async ({
  client,
  referenceId,
}: {
  client: Amity.Client;
  referenceId: string;
}) => {
  const { data: payload } = await client.http.delete<Amity.CommentPayload>(
    `/api/v3/comments/${encodeURIComponent(referenceId)}/unflag`,
  );

  if (client.cache) {
    const commentPayload = await prepareCommentPayload(payload);
    ingestInCache(commentPayload);
  }

  fireEvent(`comment.unflagged`, payload);

  return !!payload;
};

/**
 * ```js
 * import { deleteReport } from '@amityco/ts-sdk'
 * const unflagged = await deleteReport('post', postId)
 * ```
 *
 * @param referenceType The type of thing to delete a report to, such as a post or a comment.
 * @param referenceId The ID of the thing to delete a report to.
 * @returns the deleted report result
 *
 * @category Report API
 * @async
 * */
export const deleteReport = async (
  referenceType: 'user' | 'message' | 'post' | 'comment',
  referenceId: string,
): Promise<boolean> => {
  const client = getActiveClient();
  client.log('report/deleteReport', { referenceType, referenceId });

  if (referenceType === 'user') {
    return deleteUserReport({ client, referenceId });
  }

  if (referenceType === 'message') {
    return deleteMessageReport({ client, referenceId });
  }

  if (referenceType === 'post') {
    return deletePostReport({ client, referenceId });
  }

  if (referenceType === 'comment') {
    return deleteCommentReport({ client, referenceId });
  }

  return false;
};
