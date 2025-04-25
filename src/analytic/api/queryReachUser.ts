import { getActiveClient } from '~/client';
import { ingestInCache } from '~/cache/api/ingestInCache';

export const queryReachUser = async ({
  viewId,
  viewedType,
  limit,
  token,
}: {
  viewId: Amity.ViewedUsersLiveCollection['viewId'];
  viewedType: Amity.ViewedUsersLiveCollection['viewedType'];
  limit: number;
  token?: string;
}) => {
  const client = getActiveClient();

  const params: { token?: string; limit?: number } = {};
  if (token) {
    // If it's not a first query, we can use token to get next user list from previous query.
    params.token = token;
  } else {
    // First query.
    params.limit = limit;
  }

  const view = viewedType === 'post' ? 'posts' : 'stories';
  const url = `/api/v1/analytics/views/${view}/${viewId}/users`;

  const response = await client.http.get(url, {
    params,
  });

  ingestInCache(response.data);

  return response.data;
};
