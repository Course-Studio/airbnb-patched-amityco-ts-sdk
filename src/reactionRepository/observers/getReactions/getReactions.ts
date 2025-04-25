/* eslint-disable no-use-before-define */

import { getActiveClient } from '~/client/api';
import { dropFromCache } from '~/cache/api';
import { ReactionLiveCollectionController } from './ReactionLiveCollectionController';

/* begin_public_function
  id: reaction.query
*/
/**
 * ```js
 * import { getReactions } from '@amityco/ts-sdk'
 *
 * let reactions = []
 * const unsub = liveReactions({
 *   referenceId: Amity.Reaction['referenceId'],
 *   referenceType: Amity.Reaction['referenceType'],
 * }, response => merge(reactions, response.data))
 * ```
 *
 * Observe all mutations on a list of {@link Amity.InternalReactor} for a given target object
 *
 * @param params for querying reactions
 * @param callback the function to call when new data are available
 * @param config the live collection configuration
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the messages
 *
 * @category Reactions Live Collection
 */
export const getReactions = (
  params: Amity.ReactionLiveCollection,
  callback: Amity.LiveCollectionCallback<Amity.Reactor>,
  config?: Amity.LiveCollectionConfig,
): Amity.Unsubscriber => {
  const { log, cache } = getActiveClient();

  if (!cache) {
    console.log('For using Live Collection feature you need to enable Cache!');
  }

  const timestamp = Date.now();
  log(`getReactions(tmpid: ${timestamp}) > listen`);

  const reactionLiveCollection = new ReactionLiveCollectionController(params, callback);
  const disposers = reactionLiveCollection.startSubscription();
  const cacheKey = reactionLiveCollection.getCacheKey();

  disposers.push(() => {
    dropFromCache(cacheKey);
  });

  return () => {
    log(`getReactions(tmpid: ${timestamp}) > dispose`);
    disposers.forEach(fn => fn());
  };
};
/* end_public_function */
