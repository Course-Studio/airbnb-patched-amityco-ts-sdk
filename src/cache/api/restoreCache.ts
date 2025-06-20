import { getActiveClient } from '~/client/api/activeClient';

/**
 * ```js
 * import { restoreCache } from '@amityco/ts-sdk'
 * const success = await restoreCache()
 * ```
 *
 * Reads a previously saved {@link Amity.Cache} from a persistent storage,
 * and inserts it into the current {@link Amity.Cache} instance.
 *
 * The strategy for persistent storage will depend on the runtime,
 * which is supported by @react-native-async-storage/async-storage.
 *
 * The current userId will be appended to the given storageKey to ensures
 * the cached data concerns only the current user.
 *
 * @param storageKey the name of the persistent storage
 * @returns a success boolean if the cache was dumped to persistent storage
 *
 * @category Cache API
 */
export const restoreCache = async (storageKey = 'amitySdk') => {
  const client = getActiveClient();

  if (!client.cache) return false;
  client.log('cache/api/restoreCache', { storageKey });

  const serializedData = localStorage
    ? (await localStorage.getItem(`${storageKey}#${client.userId}`)) ?? '{}'
    : '{}';

  let cache: Amity.Cache['data'] = {};

  try {
    cache = JSON.parse(serializedData);
  } catch (err) {
    //
  }

  // current cache should override. in case there's something fresher.
  client.cache.data = { ...cache, ...client.cache.data };
  return true;
};
