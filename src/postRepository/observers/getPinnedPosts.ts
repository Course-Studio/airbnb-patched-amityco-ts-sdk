import { getActiveClient } from '~/client/api';
import { dropFromCache } from '~/cache/api';
import { ENABLE_CACHE_MESSAGE } from '~/utils/constants';
import { PinnedPostLiveCollectionController } from './getPinnedPosts/PinnedPostLiveCollectionController';

/**
 * Get pinned posts for a community
 *
 * @param communityId the ID of the community
 * @param placement the placement of the pinned post ('announcement' or 'default'), or null to fetch all pinned posts
 * @returns the associated pinned post(s)
 *
 * @category Pined Posts Live Collection
 *
 */
export const getPinnedPosts = (
  params: Amity.LiveCollectionParams<Amity.PinnedPostLiveCollection>,
  callback: Amity.LiveCollectionCallback<Amity.PinnedPost>,
  config?: Amity.LiveCollectionConfig,
) => {
  const { log, cache } = getActiveClient();

  if (!cache) {
    console.log(ENABLE_CACHE_MESSAGE);
  }

  const timestamp = Date.now();
  log(`getPinnedPosts(tmpid: ${timestamp}) > listen`);

  const pinnedPostLiveCollection = new PinnedPostLiveCollectionController(params, callback);
  const disposers = pinnedPostLiveCollection.startSubscription();

  const cacheKey = pinnedPostLiveCollection.getCacheKey();

  disposers.push(() => dropFromCache(cacheKey));

  return () => {
    log(`getPinnedPosts(tmpid: ${timestamp}) > dispose`);
    disposers.forEach(fn => fn());
  };
};
