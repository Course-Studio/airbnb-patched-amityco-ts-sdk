import { getActiveClient } from '~/client/api/activeClient';

import { encodeKey } from '../utils';

/**
 * ```js
 * import { pushToCache } from '@amityco/ts-sdk'
 * pushToCache<Amity.InternalUser>(["user", "foobar"], user)
 * ```
 *
 * Saves any provided value as {@link Amity.CacheEntry} for the matching {@link Amity.CacheKey}
 *
 * @param key the key to save the object to
 * @param data the object to save
 * @param options customisation object around cache behavior (default gives a 2mn lifespan)
 * @returns a success boolean if the object was saved in cache
 *
 * @category Cache API
 */
export const pushToCache = (
  key: Amity.CacheKey,
  data: unknown,
  options: Amity.CacheOptions = { cachedAt: Date.now() },
): boolean => {
  const { log, cache } = getActiveClient();

  if (!cache) return false;
  log('cache/api/pushToCache', { key, data, options });

  // if consumer did not pass offline but a offline policy is
  // defined, use the fn to determine if the object needs to
  // be saved in persistent storage or not.
  if (!options?.hasOwnProperty('offline') && cache.persistIf) {
    // eslint-disable-next-line no-param-reassign
    options.offline = cache.persistIf(key, data);
  }

  const encodedKey = encodeKey(key);
  cache.data[encodedKey] = { key, data, ...options };

  return true;
};
