/* eslint-disable no-use-before-define */
import { CACHE_LIFESPAN } from '~/cache/utils';
import { isPaged } from './paging';

/**
 * Type guard to check and cast that a given async function is has the ".locally" property
 *
 * @param func any SDK APi function
 * @returns success boolean if the function has a 'locally' twin
 *
 * @hidden
 */
export const isFetcher = <Args extends any[], Returned extends any>(
  func: Amity.AsyncFunc<Args, Returned>,
): func is Amity.FetcherFunc<Args, Returned> => 'locally' in func;

/**
 * Type guard to check and cast that a given async function is has the ".optimistically" property
 *
 * @param func any SDK APi function
 * @returns success boolean if the function has an 'optimistically' twin
 *
 * @hidden
 */
export const isMutator = <Args extends any[], Returned extends any>(
  func: Amity.AsyncFunc<Args, Returned>,
): func is Amity.MutatorFunc<Args, Returned> => 'optimistically' in func;

/**
 * Type guard to check and cast that a given async function is has
 * the ".locally" or ".optimistically" property
 *
 * @param func any SDK APi function
 * @returns success boolean if the function has an offline twin
 *
 * @hidden
 */
export const isOffline = <Args extends any[], Returned extends any>(
  func: Amity.AsyncFunc<Args, Returned>,
): func is Amity.OfflineFunc<Args, Returned> => isFetcher(func) || isMutator(func);

/**
 * Type guard to check and cast that a given object has the "cachedAt" property
 *
 * @param model any object to check on
 * @returns success boolean if the object has property "cachedAt"
 *
 * @hidden
 */
export const isCachable = (model: any): model is Amity.Cachable =>
  model?.hasOwnProperty('cachedAt');

/**
 * Checks if a model is considered local (cachedAt === -1)
 *
 * @param model any cachable object to check
 * @returns success boolean if the object is marked as local
 *
 * @hidden
 */
export const isLocal = (model?: any): model is Amity.Local => {
  return isCachable(model) && model?.cachedAt === -1;
};

/**
 * Checks if a model is considered fresh
 *
 * @param model any cachable object to check
 * @param lifeSpan the supposedly duration for which the object is considered synced
 * @returns success boolean if the object is below the given lifespan
 *
 * @hidden
 */
export const isFresh = (model?: Amity.Cachable, lifeSpan = CACHE_LIFESPAN) => {
  return Date.now() - (model?.cachedAt ?? 0) <= lifeSpan;
};

/**
 * ```js
 * import { createQuery, getUser } from '@amityco/ts-sdk'
 * const query = createQuery(getUser, 'foobar')
 * ```
 *
 * Creates a wrapper for the API call you wish to call.
 * This wrapper is necessary to create for optimistically calls
 *
 *
 * @param func A compatible API function from the ts sdk
 * @param args The arguments to pass to the function passed as `fn`
 * @returns A wrapper containing both the function and its future arguments
 *
 * @category Query
 */
export const createQuery = <Args extends any[], Returned extends any>(
  func: Amity.AsyncFunc<Args, Returned> | Amity.OfflineFunc<Args, Returned>,
  ...args: Args
) => ({ func, args });

/**
 * ```js
 * import { queryOptions } from '@amityco/ts-sdk'
 * const options = queryOptions('no_fetch', lifeSpan)
 * ```
 *
 * Creates a query options object based on the query policy passed
 *
 * @param policy The policy to apply to a query
 * @returns A properly set query options object
 *
 * @category Query
 */
export const queryOptions = (
  policy: Amity.QueryPolicy,
  lifeSpan: number = CACHE_LIFESPAN, // 1mn
): Amity.QueryOptions => {
  if (policy === 'cache_only') return { lifeSpan: Infinity };

  return { lifeSpan: lifeSpan < CACHE_LIFESPAN ? CACHE_LIFESPAN : lifeSpan };
};

/**
 * Checks if an unknown shaped payload is considered empty or not.
 * Since the payload can be wrapped around [] or {} (query or get many),
 * we need a smarter definition of what's considered "empty".
 *
 * @param local the unknown object to check for emptiness
 * @returns true if the mixed-shape "local" content is considered empty
 *
 * @hidden
 */
const isEmpty = (local: unknown) => {
  // if it's supposed to be a single object, it'd be undefined
  if (!local) return true;

  // it's a paged query, the 1st cell of the array would be empty
  if (isPaged(local) && isEmpty(local.data)) {
    return true;
  }

  // if it's a item collection, it'd have no keys
  if (typeof local === 'object' && !Object.keys(local).length) return true;

  return false;
};

/**
 * ```js
 * import { createQuery, getUser, runQuery } from '@amityco/ts-sdk'
 * const query = createQuery(getUser, client, 'foobar')
 * runQuery(query,  user => console.log(user))
 * ```
 *
 * Calls an API function wrapped around a Amity.Query, and executes the callback whenever
 * a value is available. The value can be picked either from the local cache and/or
 * from the server afterwards depending on the query options passed
 *
 * @param query A query object wrapping the call to be made
 * @param callback A function to execute when a value is available
 * @param options the query options
 *
 * @category Query
 */
export const runQuery = <Args extends any[], Returned extends any>(
  { func, args }: Amity.Query<Args, Returned>,
  callback?: (args: Amity.Snapshot<Returned>) => void,
  options: Amity.QueryOptions = queryOptions('cache_then_server'),
) => {
  let local: Returned | undefined;

  const { lifeSpan } = queryOptions('cache_then_server', options.lifeSpan);

  // offline first
  if (isOffline(func)) {
    try {
      local = isMutator(func) ? func.optimistically(...args) : func.locally(...args);
    } catch (error) {
      callback?.(
        createSnapshot<Returned>(undefined, {
          origin: 'local',
          loading: false,
          error,
        }),
      );
    }

    const shouldAbort = isCachable(local) && isFresh(local, lifeSpan);

    callback?.(
      createSnapshot<Returned>(local, {
        origin: 'local',
        loading: !(isFetcher(func) && shouldAbort),
      }),
    );

    if (shouldAbort) return;
  } else {
    callback?.(
      createSnapshot<Returned>(undefined, {
        origin: 'local',
        loading: true,
      }),
    );
  }

  func(...args)
    .then(fresh => {
      callback?.(
        createSnapshot<Returned>(fresh, {
          origin: 'server',
          loading: false,
        }),
      );
    })
    .catch(error => {
      callback?.(
        createSnapshot<Returned>(undefined, {
          origin: 'server',
          loading: false,
          error,
        }),
      );
    });
};

/**
 * This is a TS hack around types
 *
 * @param data
 * @param options
 *
 * @category Query API
 * @hidden
 */
function createSnapshot<T>(data: T | undefined, options?: Amity.SnapshotOptions): Amity.Snapshot<T>;
// eslint-disable-next-line no-redeclare
function createSnapshot(data: unknown, options?: Amity.SnapshotOptions): unknown {
  if (isPaged(data) || isCachable(data)) return { ...options, ...data };

  return { ...options, data };
}
