import { getActiveClient } from '~/client/api/activeClient';

/**
 * ```js
 * import { wipeCache } from '@amityco/ts-sdk'
 * const success = await wipeCache()
 * ```
 *
 * Wipes a persistent storage for the current {@link Amity.Cache} instance.
 *
 * The strategy for persistent storage will depend on the runtime,
 * which is supported by @react-native-async-storage/async-storage.
 *
 * The current userId will be appended to the given storageKey to avoid
 * collision between multiple client instances over time.
 *
 * @param storageKey the name of the persistent storage
 * @returns a success boolean if the persistent cache was wiped.
 *
 * @category Cache API
 */
export const wipeCache = async (storageKey = 'amitySdk') => {
  const { log, cache, userId } = getActiveClient();

  if (!cache) return false;
  log('cache/api/wipeCache', { storageKey });

  cache.data = {};
  if (localStorage) {
    await localStorage.setItem(`${storageKey}#${userId}`, '{}');
  }

  return true;
};
