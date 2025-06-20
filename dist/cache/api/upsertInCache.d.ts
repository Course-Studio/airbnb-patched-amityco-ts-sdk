/**
 * ```js
 * import { upsertInCache } from '@amityco/ts-sdk'
 * upsertInCache<Amity.InternalUser>(["user", "foobar"], user)
 * ```
 *
 * Insert or update any provided value as {@link Amity.CacheEntry} for
 * the matching {@link Amity.CacheKey}
 *
 * @param key the key to save the object to
 * @param data the object to save
 * @param options customisation object around cache behavior (default gives a 2mn lifespan)
 * @returns a success boolean if the object was saved in cache
 *
 * @category Cache API
 * @hidden
 */
export declare const upsertInCache: <T extends Record<string, unknown>>(key: Amity.CacheKey, data: T, options?: Amity.CacheOptions) => boolean;
