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
export declare const pushToCache: (key: Amity.CacheKey, data: unknown, options?: Amity.CacheOptions) => boolean;
