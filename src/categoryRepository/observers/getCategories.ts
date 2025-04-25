/* eslint-disable no-use-before-define */
import { getResolver } from '~/core/model';
import { pullFromCache, pushToCache } from '~/cache/api';
import { getActiveClient } from '~/client/api';
import {
  createQuery,
  runQuery,
  queryOptions,
  filterByPropEquality,
  sortByLastCreated,
  sortByName,
  sortByFirstCreated,
} from '~/core/query';
import {
  COLLECTION_DEFAULT_CACHING_POLICY,
  COLLECTION_DEFAULT_PAGINATION_LIMIT,
  ENABLE_CACHE_MESSAGE,
} from '~/utils/constants';
import { queryCategories } from '../internalApi/queryCategories';
import { LinkedObject } from '~/utils/linkedObject';

/* begin_public_function
  id: community.category.query
*/
/**
 * ```js
 * import { getCategories } from '@amityco/ts-sdk'
 *
 * let categories = []
 * const unsub = getCategories({}, response => merge(categories, response.data))
 * ```
 *
 * Observe all mutations on a list of {@link Amity.Category}s
 *
 * @param params for querying categories
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the categories
 *
 * @category Category Live Collection
 */
export const getCategories = (
  params: Amity.CategoryLiveCollection,
  callback: Amity.LiveCollectionCallback<Amity.Category>,
  config?: Amity.LiveCollectionConfig,
) => {
  const { log, cache } = getActiveClient();

  if (!cache) {
    console.log(ENABLE_CACHE_MESSAGE);
  }

  const timestamp = Date.now();
  log(`getCategories(tmpid: ${timestamp}) > listen`);

  const { limit: queryLimit, ...queryParams } = params;

  const limit = queryLimit ?? COLLECTION_DEFAULT_PAGINATION_LIMIT;
  const { policy = COLLECTION_DEFAULT_CACHING_POLICY } = config ?? {};

  const disposers: Amity.Unsubscriber[] = [];
  const cacheKey = ['category', 'collection', {}];

  const responder = (data: Amity.CategoryLiveCollectionCache) => {
    let categories: Amity.Category[] =
      data.data
        .map(categoryId => pullFromCache<Amity.InternalCategory>(['category', 'get', categoryId])!)
        .filter(Boolean)
        .map(({ data }) => LinkedObject.category(data)) ?? [];

    if (!params.includeDeleted) {
      categories = filterByPropEquality(categories, 'isDeleted', false);
    }

    switch (params.sortBy) {
      case 'firstCreated':
        categories = categories.sort(sortByFirstCreated);
        break;

      case 'lastCreated':
        categories = categories.sort(sortByLastCreated);
        break;

      default:
        categories = categories.sort(sortByName);
    }

    callback({
      onNextPage: onFetch,
      data: categories,
      hasNextPage: !!data.params?.page,
      loading: data.loading,
      error: data.error,
    });
  };

  /*
   * const realtimeRouter = () => {
   * @TODO: At the time of creating this method category does not have any
   * observers
   *};
   */

  const onFetch = (initial = false) => {
    const collection = pullFromCache<Amity.CategoryLiveCollectionCache>(cacheKey)?.data;

    const categories = collection?.data ?? [];

    if (!initial && categories.length > 0 && !collection?.params.page) return;

    const query = createQuery(queryCategories, {
      ...queryParams,
      limit: initial ? limit : undefined,
      page: !initial ? collection?.params.page : undefined,
    });

    runQuery(
      query,
      ({ data: result, error, loading, paging }) => {
        const data = {
          loading,
          error,
          params: { page: paging?.next },
          data: categories,
        };

        if (result) {
          data.data = [...new Set([...categories, ...result.map(getResolver('category'))])];
        }

        pushToCache(cacheKey, data);

        responder(data);
      },
      queryOptions(policy),
    );
  };

  disposers.push(() => {
    // @TODO -> update once observers added
  });

  onFetch(true);

  return () => {
    log(`getCategories(tmpid: ${timestamp}) > dispose`);
    disposers.forEach(fn => fn());
  };
};
/* end_public_function */
