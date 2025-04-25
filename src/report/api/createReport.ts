import { getActiveClient } from '~/client/api/activeClient';

import { ingestInCache } from '~/cache/api/ingestInCache';
import { fireEvent } from '~/core/events';
import { prepareMessagePayload } from '~/messageRepository/utils';
import { preparePostPayload } from '~/postRepository/utils/payload';
import { prepareUserPayload } from '~/userRepository/utils/prepareUserPayload';
import { prepareCommentPayload } from '~/commentRepository/utils/payload';

const createMessageReport = async ({
  client,
  referenceId,
}: {
  client: Amity.Client;
  referenceId: string;
}) => {
  const { data: payload } = await client.http.post<Amity.MessagePayload>(
    `/api/v5/messages/${encodeURIComponent(referenceId)}/flags`,
  );

  if (client.cache) {
    const messagePayload = await prepareMessagePayload(payload as Amity.MessagePayload);
    ingestInCache(messagePayload);
  }

  fireEvent(`message.flagged`, payload);

  return !!payload;
};

const createPostReport = async ({
  client,
  referenceId,
}: {
  client: Amity.Client;
  referenceId: string;
}) => {
  const { data: payload } = await client.http.post<Amity.PostPayload>(
    `/api/v3/posts/${encodeURIComponent(referenceId)}/flag`,
  );

  if (client.cache) {
    const postPayload = await preparePostPayload(payload);
    ingestInCache(postPayload);
  }

  fireEvent(`post.flagged`, payload);

  return !!payload;
};

const createUserReport = async ({
  client,
  referenceId,
}: {
  client: Amity.Client;
  referenceId: string;
}) => {
  const { data: payload } = await client.http.post<Amity.UserPayload>(
    `/api/v4/me/flags/${encodeURIComponent(referenceId)}`,
  );

  if (client.cache) {
    const userPayload = await prepareUserPayload(payload);
    ingestInCache(userPayload);
  }

  fireEvent(`user.flagged`, payload);

  return !!payload;
};

const createCommentReport = async ({
  client,
  referenceId,
}: {
  client: Amity.Client;
  referenceId: string;
}) => {
  const { data: payload } = await client.http.post<Amity.CommentPayload>(
    `/api/v3/comments/${encodeURIComponent(referenceId)}/flag`,
  );

  if (client.cache) {
    const commentPayload = await prepareCommentPayload(payload);
    ingestInCache(commentPayload);
  }

  fireEvent(`comment.flagged`, payload);

  return !!payload;
};

/**
 * ```js
 * import { createReport } from '@amityco/ts-sdk'
 * const flagged = await createReport('post', postId)
 * ```
 *
 * @param referenceType The type of thing to add a report to, such as a post or a comment.
 * @param referenceId The ID of the thing to add a new report to.
 * @returns the created report result
 *
 * @category Report API
 * @async
 * */
export const createReport = async (
  referenceType: 'post' | 'comment' | 'message' | 'user',
  referenceId: string,
): Promise<boolean> => {
  const client = getActiveClient();
  client.log('report/createReport', { referenceType, referenceId });

  if (referenceType === 'user') {
    return createUserReport({ client, referenceId });
  }

  if (referenceType === 'message') {
    return createMessageReport({ client, referenceId });
  }

  if (referenceType === 'post') {
    return createPostReport({ client, referenceId });
  }

  if (referenceType === 'comment') {
    return createCommentReport({ client, referenceId });
  }

  return false;
};
