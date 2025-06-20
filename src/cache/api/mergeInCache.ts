import { getActiveClient } from '~/client/api/activeClient';
import { isOutdated } from '~/core/model';

import { pullFromCache } from './pullFromCache';
import { pushToCache } from './pushToCache';

/**
 * ```js
 * import { mergeInCache } from '@amityco/ts-sdk'
 *
 * mergeInCache(
 *   ["foo", "bar"],
 *   (oldVal) => ({ ...oldVal, ...newVal }).
 * )
 * ```
 *
 * Merges a new {@link Amity.Cache} object to an {@link Amity.Client} instance
 *
 * @param key the key matching the object to retrieve from cache
 * @param mutation either a plain object to shallow merge, or a function.
 * @returns a success boolean if the object was updated
 *
 * @category Cache API
 */
export const mergeInCache = <T extends Record<string, unknown>>(
  key: Amity.CacheKey,
  mutation: Partial<T> | ((oldVal: T) => T),
  options?: Amity.CacheOptions,
): boolean => {
  const { log, cache } = getActiveClient();

  if (!cache) return false;
  log('cache/api/mergeInCache', { key, mutation });

  const oldVal = pullFromCache<T>(key);

  if (!oldVal) return false;

  const newVal =
    typeof mutation === 'function' ? mutation(oldVal.data) : { ...oldVal.data, ...mutation };

  if (isOutdated(oldVal.data, newVal)) {
    return false;
  }

  pushToCache(key, newVal, options);
  return true;
};
