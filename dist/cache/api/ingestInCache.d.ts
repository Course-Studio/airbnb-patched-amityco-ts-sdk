import { PAYLOAD2MODEL } from '~/core/model';
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
export declare const ingestInCache: (payload?: Record<keyof typeof PAYLOAD2MODEL, Amity.Model[]>, options?: Amity.CacheOptions, replace?: boolean) => void;
//# sourceMappingURL=ingestInCache.d.ts.map