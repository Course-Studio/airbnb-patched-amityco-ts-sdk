// cache constants
import { MINUTE, SECOND } from '~/utils/constants';

export const CACHE_KEY_GET = 'get';
export const CACHE_KEY_QUERY = 'query';
export const CACHE_KEY_TOMBSTONE = 'dead';
export const CACHE_KEY_COLLECTION = 'collection';

export const CACHE_SHORTEN_LIFESPAN = 2 * SECOND;
export const CACHE_LIFESPAN = 1 * MINUTE; // 1 minute
export const CACHE_LIFESPAN_TOMBSTONE = 3 * MINUTE; // 3 minutes

/**
 * Shallow-clones an object and sort its keys
 *
 * @param source a plain object to clone
 * @returns a clone of source, with keys sorted with default javascript sorting
 *
 * @category Cache
 * @hidden
 */
const normalize = (
  source: Record<string, Amity.Serializable>,
): Record<string, Amity.Serializable> =>
  Object.keys(source)
    .sort()
    .reduce((acc, key) => ({ ...acc, [key]: source[key] }), {});

/**
 * Encodes a given {@link Amity.CacheKey} to a plain string
 *
 * @param key the key to encode
 * @returns an encoded string
 *
 * @category Cache
 * @hidden
 */
export const encodeKey = (key: Amity.CacheKey): string =>
  JSON.stringify(key, (_, val) => (typeof val === 'object' ? normalize(val) : val));

/**
 * Decodes a string back into a {@link Amity.CacheKey}

 *
 * @param key the string key to decode
 * @returns a plain Amity.CacheKey object.
 *
 * @category Cache
 * @hidden
 */
export const decodeKey = (key: string): Amity.CacheKey => JSON.parse(key);

/**
 * Performs a recursive partial deep equal check on two objects.
 *
 * @param predicate the reference object containing the partial information
 * @param candidate the object to check against
 * @returns true if the candidate contains all the values of the predicate
 *
 * @category Cache
 */
export const partialMatch = (predicate: any, candidate: any): boolean => {
  if (predicate === candidate) return true;

  // if one or the other is nullish, there can't be equality
  if (!predicate || !candidate) return false;

  // we only perform recursive check on objects
  if (typeof predicate !== 'object') {
    return false;
  }

  // recursively call for partial match based on the predicate
  return Object.keys(predicate).every(key => partialMatch(predicate[key], candidate[key]));
};

/**
 * Type guard to check and cast that a given predicate matched {@link Amity.Cached} shape
 *
 * @param obj any {@link Amity.Cached}-like object
 * @returns success boolean if the given object is of {@link Amity.Cached} shape
 *
 * @category Cache
 */
export const isCached = <T extends unknown>(obj?: any): obj is Amity.Cached<T> =>
  ['data', 'cachedAt'].every(prop => obj?.hasOwnProperty(prop));

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
export const checkIfShouldGoesToTombstone = (errorCode: Amity.ServerError): boolean =>
  [Amity.ServerError.ITEM_NOT_FOUND, Amity.ServerError.FORBIDDEN].includes(errorCode);
