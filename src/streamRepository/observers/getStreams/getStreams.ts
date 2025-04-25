import { getActiveClient } from '~/client';
import { ENABLE_CACHE_MESSAGE } from '~/utils/constants';
import { dropFromCache } from '~/cache/api';
import { GetStreamsLiveCollectionController } from '~/streamRepository/observers/getStreams/GetStreamsLiveCollectionController';

export const getStreams = (
  params: Amity.StreamLiveCollection,
  callback: Amity.LiveCollectionCallback<Amity.Stream>,
  config?: Amity.LiveCollectionConfig,
) => {
  const { log, cache, userId } = getActiveClient();

  if (!cache) {
    console.log(ENABLE_CACHE_MESSAGE);
  }

  const timestamp = Date.now();
  log(`getStreams(tmpid: ${timestamp}) > listen`);

  const liveCollection = new GetStreamsLiveCollectionController(params, callback);
  const disposers = liveCollection.startSubscription();
  const cacheKey = liveCollection.getCacheKey();

  disposers.push(() => {
    dropFromCache(cacheKey);
  });

  return () => {
    log(`getStreams(tmpid: ${timestamp}) > dispose`);
    disposers.forEach(fn => fn());
  };
};
