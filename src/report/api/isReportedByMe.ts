import { getActiveClient } from '~/client/api/activeClient';

type ResponseData = { result?: boolean; isFlagByMe?: boolean };

const getMessageReport = async ({
  client,
  referenceId,
}: {
  client: Amity.Client;
  referenceId: string;
}) => {
  const { data } = await client.http.get<ResponseData>(
    `/api/v5/messages/${encodeURIComponent(referenceId)}/flags`,
  );

  const { result, isFlagByMe } = data ?? {};

  return result ?? isFlagByMe ?? false;
};

const getPostReport = async ({
  client,
  referenceId,
}: {
  client: Amity.Client;
  referenceId: string;
}) => {
  const { data } = await client.http.get<ResponseData>(`/api/v3/posts/${referenceId}/isflagbyme`);

  const { result, isFlagByMe } = data ?? {};

  return result ?? isFlagByMe ?? false;
};

const getUserReport = async ({
  client,
  referenceId,
}: {
  client: Amity.Client;
  referenceId: string;
}) => {
  const { data } = await client.http.get<ResponseData>(`/api/v3/users/${referenceId}/isflagbyme`);

  const { result, isFlagByMe } = data ?? {};

  return result ?? isFlagByMe ?? false;
};

const getCommentReport = async ({
  client,
  referenceId,
}: {
  client: Amity.Client;
  referenceId: string;
}) => {
  const { data } = await client.http.get<ResponseData>(
    `/api/v3/comments/${referenceId}/isflagbyme`,
  );

  const { result, isFlagByMe } = data ?? {};

  return result ?? isFlagByMe ?? false;
};

/**
 * ```js
 * import { isReportedByMe } from '@amityco/ts-sdk'
 * const isReported = await isReportedByMe('post', postId)
 * ```
 *
 * @param referenceType The type of thing to check a report to, such as a post or a comment.
 * @param referenceId The ID of the thing to check a report to.
 * @returns `true` if the report is created by me, `false` if doesn't.
 *
 * @category Report API
 * @async
 * */
export const isReportedByMe = async (
  referenceType: 'user' | 'message' | 'post' | 'comment',
  referenceId: string,
): Promise<boolean> => {
  const client = getActiveClient();
  client.log('report/isReportedByMe', { referenceType, referenceId });

  if (referenceType === 'user') {
    return getUserReport({ client, referenceId });
  }

  if (referenceType === 'message') {
    return getMessageReport({ client, referenceId });
  }

  if (referenceType === 'post') {
    return getPostReport({ client, referenceId });
  }

  if (referenceType === 'comment') {
    return getCommentReport({ client, referenceId });
  }

  return false;
};
