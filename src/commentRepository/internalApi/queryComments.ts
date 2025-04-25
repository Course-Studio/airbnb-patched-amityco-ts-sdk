import { getActiveClient } from '~/client/api';
import { pushToCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { getResolver } from '~/core/model';
import { inferIsDeleted } from '~/utils/inferIsDeleted';
import { convertToInternalComment } from '../utils/convertToInternalComment';

export const queryComments = async (
  query: Amity.QueryComments,
): Promise<Amity.Cached<Amity.PageToken<Amity.InternalComment>>> => {
  const client = getActiveClient();
  client.log('comment/queryComments', query);

  const { limit = 10, includeDeleted, ...params } = query;

  const options = {
    type: params.sortBy || query.limit ? 'pagination' : undefined,
    limit: query.limit,
    token: query.page,
  };
  // const filterByParentId = query.parentId !== undefined

  // API-FIX: parameters should be querystring. (1)
  // API-FIX: backend should answer Amity.Response (2)
  // const { data } = await client.http.get<Amity.Response<Amity.PagedResponse<Amity.CommentPayload>>>(
  const { data } = await client.http.get<Amity.CommentPayload & Amity.Pagination>(
    `/api/v3/comments`,
    {
      params: {
        ...params,
        isDeleted: inferIsDeleted(includeDeleted),
        //      filterByParentId, API-FIX: backend does not support this boolean LOL. what the hell seriously.
        options,
      },
    },
  );

  // API-FIX: backend should answer Amity.Response (2)
  // const { paging, comments } = unwrapPayload(data)
  const { paging, ...payload } = data;
  const processedData = convertToInternalComment(payload);
  const { comments } = processedData;

  const cachedAt = client.cache && Date.now();

  if (client.cache) {
    ingestInCache(processedData as Amity.CommentPayload, { cachedAt });

    const cacheKey = ['comment', 'query', { ...params, options: { limit } } as Amity.Serializable];
    pushToCache(cacheKey, { comments: comments.map(getResolver('comment')), paging });
  }

  return { data: comments, cachedAt, paging };
};
