import { getActiveClient } from '~/client';
import { ENABLE_CACHE_MESSAGE } from '~/utils/constants';
import { dropFromCache, pullFromCache, pushToCache } from '~/cache/api';
import { createQuery, runQuery } from '~/core/query';
import { getResolver } from '~/core/model';
import { LinkedObject } from '~/utils/linkedObject';
import { getTargetsByTargetIds as _getTargetsByTargetIds } from '../internalApi/getTargetsByTargetIds';

export const getTargetsByTargetIds = (
  params: Amity.StoryTargetQueryParam[],
  callback: Amity.LiveCollectionCallback<Amity.StoryTarget | undefined>,
) => {
  const { log, cache } = getActiveClient();

  const disposers: Amity.Unsubscriber[] = [];
  const cacheKey = ['storyTargets', 'collection', params];

  const timestamp = Date.now();
  log(`getTargetsByTargetIds(tmpid: ${timestamp}) > listen`);

  if (!cache) {
    console.log(ENABLE_CACHE_MESSAGE);
  }

  const responder = (snapshot: Amity.StoryTargetLiveCollectionCache) => {
    const storyTargets = snapshot.data
      .map(targetId => {
        const storyTargetCache = pullFromCache<Amity.RawStoryTarget>([
          'storyTarget',
          'get',
          targetId,
        ]);

        if (!storyTargetCache?.data) return undefined;
        return LinkedObject.storyTarget(storyTargetCache.data);
      })
      .filter(Boolean);

    callback({
      onNextPage: undefined,
      data: storyTargets,
      hasNextPage: !!snapshot.params?.page,
      loading: snapshot.loading || false,
    });
  };

  const processNewData = (
    result: Amity.RawStoryTarget[] | undefined,
    initial = false,
    loading = false,
    error = false,
  ) => {
    const cached = pullFromCache<Amity.RawStoryTarget['targetId']>(cacheKey);

    const data: Amity.StoryTargetLiveCollectionCache = {
      loading,
      error,
      params: { page: undefined },
      data: [],
    };

    if (result) {
      data.data = initial
        ? result.map(getResolver('storyTarget'))
        : [...new Set([...(cached?.data || []), ...result.map(getResolver('storyTarget'))])];
    }

    pushToCache(cacheKey, data.data);

    responder(data);
  };

  const onFetch = (initial: boolean) => {
    const query = createQuery(_getTargetsByTargetIds, params);

    runQuery(query, ({ data: result, error, loading }) => {
      processNewData(result, initial, loading, error);
    });
  };

  onFetch(true);
  disposers.push(() => dropFromCache(cacheKey));

  return () => {
    log(`getTargetsByTargetIds(tmpid: ${timestamp}) > dispose`);
    disposers.forEach(fn => fn());
  };
};
