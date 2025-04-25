import { getActiveClient } from '~/client/api/activeClient';

import { pullFromCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { LinkedObject } from '~/utils/linkedObject';

/* begin_public_function
  id: community.category.get
*/
/**
 * ```js
 * import { getCategory } from '@amityco/ts-sdk'
 * const { data: category } = await getCategory('foo')
 * ```
 *
 * Fetches a {@link Amity.Category} object
 *
 * @param categoryId the ID of the {@link Amity.Category} to fetch
 * @returns the associated {@link Amity.Category} object
 *
 * @category Category API
 * @async
 */
export const getCategory = async (
  categoryId: Amity.Category['categoryId'],
): Promise<Amity.Cached<Amity.Category>> => {
  const client = getActiveClient();
  client.log('category/getCategory', categoryId);

  const { data } = await client.http.get<Amity.CategoryPayload>(
    `/api/v3/community-categories/${encodeURIComponent(categoryId)}`,
  );

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(data, { cachedAt });

  const { categories } = data;

  return {
    data: LinkedObject.category(categories.find(category => category.categoryId === categoryId)!),
    cachedAt,
  };
};
/* end_public_function */

/**
 * ```js
 * import { getCategory } from '@amityco/ts-sdk'
 * const { data: category } = getCategory.locally('foobar')
 * ```
 *
 * Fetches a {@link Amity.Category} object from cache
 *
 * @param categoryId the ID of the {@link Amity.Category} to fetch
 * @returns the associated {@link Amity.Category} object
 *
 * @category Category API
 */
getCategory.locally = (
  categoryId: Amity.Category['categoryId'],
): Amity.Cached<Amity.Category> | undefined => {
  const client = getActiveClient();
  client.log('category/getCategory.locally', categoryId);

  if (!client.cache) return;

  const cached = pullFromCache<Amity.InternalCategory>(['category', 'get', categoryId]);

  if (!cached) return;

  return {
    data: LinkedObject.category(cached.data),
    cachedAt: cached.cachedAt,
  };
};
