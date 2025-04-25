import { getActiveClient } from '~/client/api';
import { dropFromCache } from '~/cache/api';

import { CommentLiveCollectionController } from './getComments/CommentLiveCollectionController';

/* begin_public_function
  id: comment.query
*/
/**
 * ```js
 * import { getComments } from '@amityco/ts-sdk'
 *
 * let comments = []
 * const unsub = getComments({
 *   referenceType: Amity.InternalComment['referenceType'];
 *   referenceId: Amity.InternalComment['referenceId'];
 * }, response => merge(comments, response.data))
 * ```
 *
 * Observe all mutations on a list of {@link Amity.InternalComment} for a given target object
 *
 * @param referenceType the type of the target
 * @param referenceId the ID of the target
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the messages
 *
 * @category Comments Live Collection
 */
export const getComments = (
  params: Amity.CommentLiveCollection,
  callback: Amity.LiveCollectionCallback<Amity.Comment>,
  config?: Amity.LiveCollectionConfig,
): Amity.Unsubscriber => {
  const { log, cache } = getActiveClient();

  if (!cache) {
    console.log('For using Live Collection feature you need to enable Cache!');
  }

  const timestamp = Date.now();
  log(`getComments(tmpid: ${timestamp}) > listen`);

  const commentsLiveCollection = new CommentLiveCollectionController(params, callback);
  const disposers = commentsLiveCollection.startSubscription();

  const cacheKey = commentsLiveCollection.getCacheKey();

  disposers.push(() => dropFromCache(cacheKey));

  return () => {
    log(`getComments(tmpid: ${timestamp}) > dispose`);
    disposers.forEach(fn => fn());
  };
};
/* end_public_function */
