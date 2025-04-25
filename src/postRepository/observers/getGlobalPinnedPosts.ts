import { getActiveClient } from '~/client/api';
import { dropFromCache } from '~/cache/api';
import { ENABLE_CACHE_MESSAGE } from '~/utils/constants';
import { GlobalPinnedPostLiveCollectionController } from './getGlobalPinnedPosts/GlobalPinnedPostLiveCollectionController';

/**
 * Get global pinned posts
 *
 * @returns the global pinned post(s)
 *
 * @category Pined Posts Live Collection
 *
 */
export const getGlobalPinnedPosts = (
  params: Amity.LiveCollectionParams<Amity.GlobalPinnedPostLiveCollection>,
  callback: Amity.LiveCollectionCallback<Amity.PinnedPost>,
  config?: Amity.LiveCollectionConfig,
) => {
  const { log, cache } = getActiveClient();

  if (!cache) {
    console.log(ENABLE_CACHE_MESSAGE);
  }

  const timestamp = Date.now();
  log(`getGlobalPinnedPosts(tmpid: ${timestamp}) > listen`);

  const globalPinnedPostLiveCollection = new GlobalPinnedPostLiveCollectionController(
    params,
    callback,
  );
  const disposers = globalPinnedPostLiveCollection.startSubscription();

  const cacheKey = globalPinnedPostLiveCollection.getCacheKey();

  disposers.push(() => dropFromCache(cacheKey));

  return () => {
    log(`getGlobalPinnedPosts(tmpid: ${timestamp}) > dispose`);
    disposers.forEach(fn => fn());
  };
};
