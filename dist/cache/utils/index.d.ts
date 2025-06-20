export declare const CACHE_KEY_GET = "get";
export declare const CACHE_KEY_QUERY = "query";
export declare const CACHE_KEY_TOMBSTONE = "dead";
export declare const CACHE_KEY_COLLECTION = "collection";
export declare const CACHE_SHORTEN_LIFESPAN: number;
export declare const CACHE_LIFESPAN: number;
export declare const CACHE_LIFESPAN_TOMBSTONE: number;
/**
 * Encodes a given {@link Amity.CacheKey} to a plain string
 *
 * @param key the key to encode
 * @returns an encoded string
 *
 * @category Cache
 * @hidden
 */
export declare const encodeKey: (key: Amity.CacheKey) => string;
/**
 * Decodes a string back into a {@link Amity.CacheKey}

 *
 * @param key the string key to decode
 * @returns a plain Amity.CacheKey object.
 *
 * @category Cache
 * @hidden
 */
export declare const decodeKey: (key: string) => Amity.CacheKey;
/**
 * Performs a recursive partial deep equal check on two objects.
 *
 * @param predicate the reference object containing the partial information
 * @param candidate the object to check against
 * @returns true if the candidate contains all the values of the predicate
 *
 * @category Cache
 */
export declare const partialMatch: (predicate: any, candidate: any) => boolean;
/**
 * Type guard to check and cast that a given predicate matched {@link Amity.Cached} shape
 *
 * @param obj any {@link Amity.Cached}-like object
 * @returns success boolean if the given object is of {@link Amity.Cached} shape
 *
 * @category Cache
 */
export declare const isCached: <T extends unknown>(obj?: any) => obj is Amity.Cached<T>;
/**
 * checks if passed error code is included in
 * Tombstone errors list
 *
 * @param errorCode as {@link Amity.ServerError}
 * @returns success boolean if the given errorCode
 * is included in Tombstone errors list
 *
 * @category Cache
 */
export declare const checkIfShouldGoesToTombstone: (errorCode: Amity.ServerError) => boolean;
