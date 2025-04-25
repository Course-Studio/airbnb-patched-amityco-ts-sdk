import { getActiveClient } from '~/client';
import { ENABLE_CACHE_MESSAGE } from '~/utils/constants';
import { dropFromCache } from '~/cache/api';
import { GlobalStoryLiveCollectionController } from './GlobalStoryLiveCollectionController';

export const getGlobalStoryTargets = (
  params: Amity.LiveCollectionParams<Amity.StoryGlobalQuery>,
  callback: Amity.LiveCollectionCallback<Amity.StoryTarget>,
  config?: Amity.LiveCollectionConfig,
) => {
  const { log, cache, userId } = getActiveClient();

  if (!cache) {
    console.log(ENABLE_CACHE_MESSAGE);
  }

  const timestamp = Date.now();
  log(`getGlobalStoryTarget(tmpid: ${timestamp}) > listen`);

  const storyLiveCollection = new GlobalStoryLiveCollectionController(params, callback);
  const disposers = storyLiveCollection.startSubscription();
  const cacheKey = storyLiveCollection.getCacheKey();

  disposers.push(() => {
    dropFromCache(cacheKey);
  });

  return () => {
    log(`getGlobalStoryTarget(tmpid: ${timestamp}) > dispose`);
    disposers.forEach(fn => fn());
  };
};
