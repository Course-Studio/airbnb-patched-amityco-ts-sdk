import { getActiveClient } from '~/client/api';
import { dropFromCache } from '~/cache/api';
import { ENABLE_CACHE_MESSAGE } from '~/utils/constants';
import { SemanticSearchCommunityLiveCollectionController } from './semanticSearch/SemanticSearchCommunityLiveCollectionController';

/**
 * search posts by semantic search
 *
 * @returns the associated pinned post(s)
 *
 * @category Posts Live Collection
 *
 */
export const semanticSearchCommunities = (
  params: Amity.LiveCollectionParams<Amity.SemanticSearchCommunityLiveCollection>,
  callback: Amity.LiveCollectionCallback<Amity.Community>,
  config?: Amity.LiveCollectionConfig,
) => {
  const { log, cache } = getActiveClient();

  if (!cache) {
    console.log(ENABLE_CACHE_MESSAGE);
  }

  const timestamp = Date.now();
  log(`semanticSearchCommunities(tmpid: ${timestamp}) > listen`);

  const semanticSearchPostLiveCollection = new SemanticSearchCommunityLiveCollectionController(
    params,
    callback,
  );
  const disposers = semanticSearchPostLiveCollection.startSubscription();

  const cacheKey = semanticSearchPostLiveCollection.getCacheKey();

  disposers.push(() => dropFromCache(cacheKey));

  return () => {
    log(`semanticSearchCommunities(tmpid: ${timestamp}) > dispose`);
    disposers.forEach(fn => fn());
  };
};
