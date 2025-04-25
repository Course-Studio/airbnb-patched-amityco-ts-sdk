import { PAYLOAD2MODEL, getResolver } from '~/core/model';

import { pushToCache } from './pushToCache';
import { upsertInCache } from './upsertInCache';

/**
 * Ingest a payload (v3) into the cache
 *
 * @param payload a "backend v3" payload object
 * @param options caching options like cachedAt or offline
 * @param replace If TRUE it will overwrite the current cache with payload, if FALSE it will merge the payload into cache.
 *
 * @category Cache
 * @hidden
 */
export const ingestInCache = (
  payload: Record<keyof typeof PAYLOAD2MODEL, Amity.Model[]> = {},
  options?: Amity.CacheOptions,
  replace = true,
) => {
  Object.entries(payload).forEach(([key, models]) => {
    const type = PAYLOAD2MODEL[key];
    if (!type) return;

    const resolver = getResolver(type);
    if (!resolver) return;

    models.forEach(model => {
      (replace ? pushToCache : upsertInCache)([type, 'get', resolver(model)], model, options);
    });
  });
};
