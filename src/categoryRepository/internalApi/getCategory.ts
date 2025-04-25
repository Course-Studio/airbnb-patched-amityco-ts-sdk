import { getActiveClient } from '~/client/api/activeClient';

import { pullFromCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';

export const getCategory = async (
  categoryId: Amity.InternalCategory['categoryId'],
): Promise<Amity.Cached<Amity.InternalCategory>> => {
  const client = getActiveClient();
  client.log('category/getCategory', categoryId);

  const { data } = await client.http.get<Amity.CategoryPayload>(
    `/api/v3/community-categories/${encodeURIComponent(categoryId)}`,
  );

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(data, { cachedAt });

  const { categories } = data;

  return {
    data: categories.find(category => category.categoryId === categoryId)!,
    cachedAt,
  };
};

getCategory.locally = (
  categoryId: Amity.InternalCategory['categoryId'],
): Amity.Cached<Amity.InternalCategory> | undefined => {
  const client = getActiveClient();
  client.log('category/getCategory.locally', categoryId);

  if (!client.cache) return;

  const cached = pullFromCache<Amity.InternalCategory>(['category', 'get', categoryId]);

  if (!cached) return;

  return {
    data: cached.data,
    cachedAt: cached.cachedAt,
  };
};
