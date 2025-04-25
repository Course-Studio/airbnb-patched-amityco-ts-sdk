import { getActiveClient } from '~/client/api';
import { dropFromCache } from '~/cache/api';

import { ENABLE_CACHE_MESSAGE } from '~/utils/constants';
import { PostLiveCollectionController } from './getPosts/PostLiveCollectionController';

/* begin_public_function
  id: post.query
*/
/**
 * ```js
 * import { PostRepository } from '@amityco/ts-sdk'
 *
 * let posts = []
 * const unsub = PostRepository.getPosts({
 *   targetType: Amity.PostTargetType,
 *   targetId: Amity.Post['targetId'],
 * }, response => merge(posts, response.data))
 * ```
 *
 * Observe all mutations on a list of {@link Amity.Post} for a given target object
 *
 * @param params.targetType the type of the target
 * @param params.targetId the ID of the target
 * @param callback the function to call when new data are available
 * @param config
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the messages
 *
 * @category Posts Live Collection
 */
export const getPosts = (
  params: Amity.PostLiveCollection,
  callback: Amity.LiveCollectionCallback<Amity.Post>,
  config?: Amity.LiveCollectionConfig,
): Amity.Unsubscriber => {
  const { log, cache } = getActiveClient();

  if (!cache) {
    console.log(ENABLE_CACHE_MESSAGE);
  }

  const timestamp = Date.now();
  log(`getPosts(tmpid: ${timestamp}) > listen`);

  const postsLiveCollection = new PostLiveCollectionController(params, callback);
  const disposers = postsLiveCollection.startSubscription();

  const cacheKey = postsLiveCollection.getCacheKey();

  disposers.push(() => dropFromCache(cacheKey));

  return () => {
    log(`getPosts(tmpid: ${timestamp}) > dispose`);
    disposers.forEach(fn => fn());
  };
};
/* end_public_function */
