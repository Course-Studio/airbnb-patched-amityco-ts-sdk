import { getActiveClient } from '~/client/api/activeClient';

import { toPage } from '~/core/query';

import { pullFromCache, pushToCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { getResolver } from '~/core/model';

import { inferIsDeleted } from '~/utils/inferIsDeleted';

export const queryCategories = async (
  query?: Amity.QueryCategories,
): Promise<Amity.Cached<Amity.PageToken<Amity.InternalCategory>>> => {
  const client = getActiveClient();
  client.log('category/queryCategories', query);

  const { page, limit, includeDeleted, ...params } = query ?? {};

  const options = (() => {
    if (page) return { token: page };
    if (limit) return { limit };

    return undefined;
  })();

  const { data } = await client.http.get<Amity.CategoryPayload & Amity.Pagination>(
    `/api/v3/community-categories`,
    {
      params: {
        ...params,
        isDeleted: inferIsDeleted(includeDeleted),
        options,
      },
    },
  );

  const { paging, ...payload } = data;
  const { categories } = payload;

  const cachedAt = client.cache && Date.now();

  if (client.cache) {
    ingestInCache(payload as Amity.CategoryPayload, { cachedAt });

    const cacheKey = [
      'category',
      'query',
      { ...params, includeDeleted, options } as Amity.Serializable,
    ];
    pushToCache(cacheKey, { categories: categories.map(getResolver('category')), paging });
  }

  return {
    data: categories,
    cachedAt,
    paging,
  };
};

queryCategories.locally = (
  query: Parameters<typeof queryCategories>[0],
): Amity.Cached<Amity.PageToken<Amity.InternalCategory>> | undefined => {
  const client = getActiveClient();
  client.log('category/queryCategories.locally', query);

  if (!client.cache) return;

  const { page, limit = 10, ...params } = query ?? {};

  const options = (() => {
    if (page) return { token: page };
    if (limit) return { limit };

    return undefined;
  })();

  const queryKey = ['category', 'query', { ...params, options } as Amity.Serializable];
  const { data, cachedAt } =
    pullFromCache<{ categories: Pick<Amity.InternalCategory, 'categoryId'>[] } & Amity.Pagination>(
      queryKey,
    ) ?? {};

  if (!data?.categories.length) return;

  const categories: Amity.InternalCategory[] = data.categories
    .map(categoryId => pullFromCache<Amity.InternalCategory>(['category', 'get', categoryId])!)
    .filter(Boolean)
    .map(({ data }) => data);

  const { paging } = data;

  return categories.length === data?.categories?.length
    ? { data: categories, cachedAt, paging }
    : undefined;
};
