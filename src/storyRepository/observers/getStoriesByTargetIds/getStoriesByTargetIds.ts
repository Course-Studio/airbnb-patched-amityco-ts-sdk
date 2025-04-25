import { dropFromCache } from '~/cache/api';
import { getActiveClient } from '~/client';
import { ENABLE_CACHE_MESSAGE } from '~/utils/constants';
import { StoryLiveCollectionController } from './StoryLiveCollectionController';

export const getStoriesByTargetIds = (
  params: { targets: Amity.StoryTargetQueryParam[]; options?: Amity.StorySortOption },
  callback: Amity.LiveCollectionCallback<Amity.Story>,
  config?: Amity.LiveCollectionConfig,
) => {
  const { log, cache, userId } = getActiveClient();

  if (!cache) {
    console.log(ENABLE_CACHE_MESSAGE);
  }

  const timestamp = Date.now();
  log(`getStoriesByTargetIds(tmpid: ${timestamp}) > listen`);

  const storyLiveCollection = new StoryLiveCollectionController(params, callback);
  const disposers = storyLiveCollection.startSubscription();
  const cacheKey = storyLiveCollection.getCacheKey();

  disposers.push(() => {
    dropFromCache(cacheKey);
  });

  return () => {
    log(`getStoriesByTargetIds(tmpid: ${timestamp}) > dispose`);
    disposers.forEach(fn => fn());
  };
};
