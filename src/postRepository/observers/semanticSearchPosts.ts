import { getActiveClient } from '~/client/api';
import { dropFromCache } from '~/cache/api';
import { ENABLE_CACHE_MESSAGE } from '~/utils/constants';
import { SemanticSearchPostLiveCollectionController } from './semanticSearch/SemanticSearchPostLiveCollectionController';

/**
 * search posts by semantic search
 *
 * @returns the associated pinned post(s)
 *
 * @category Posts Live Collection
 *
 */
export const semanticSearchPosts = (
  params: Amity.LiveCollectionParams<Amity.SemanticSearchPostLiveCollection>,
  callback: Amity.LiveCollectionCallback<Amity.Post>,
  config?: Amity.LiveCollectionConfig,
) => {
  const { log, cache } = getActiveClient();

  if (!cache) {
    console.log(ENABLE_CACHE_MESSAGE);
  }

  const timestamp = Date.now();
  log(`semanticSearchPosts(tmpid: ${timestamp}) > listen`);

  const semanticSearchPostLiveCollection = new SemanticSearchPostLiveCollectionController(
    params,
    callback,
  );
  const disposers = semanticSearchPostLiveCollection.startSubscription();

  const cacheKey = semanticSearchPostLiveCollection.getCacheKey();

  disposers.push(() => dropFromCache(cacheKey));

  return () => {
    log(`semanticSearchPosts(tmpid: ${timestamp}) > dispose`);
    disposers.forEach(fn => fn());
  };
};
