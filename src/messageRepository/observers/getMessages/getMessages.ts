import { getActiveClient } from '~/client/api';
import { dropFromCache } from '~/cache/api';
import { ENABLE_CACHE_MESSAGE } from '~/utils/constants';
import { MessageLiveCollectionController } from './MessageLiveCollectionController';

/* begin_public_function
  id: message.query
*/
/**
 * ```js
 * import { getMessages } from '@amityco/ts-sdk';
 *
 * let messages = [];
 *
 * const unsubscribe = getMessages({
 *   subChannelId: Amity.SubChannel['subChannelId'];
 * }, response => merge(messages, response.data));
 * ```
 *
 * Observe all mutations on a list of {@link Amity.Message} for a given target object
 *
 * @param params for querying messages from a sub channel
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the messages
 *
 * @category Messages Live Collection
 */
export const getMessages = (
  params: Amity.MessagesLiveCollection,
  callback: Amity.LiveCollectionCallback<Amity.Message>,
  config?: Amity.LiveCollectionConfig,
): Amity.Unsubscriber => {
  const { log, cache } = getActiveClient();

  if (!cache) {
    console.log(ENABLE_CACHE_MESSAGE);
  }

  const timestamp = Date.now();
  log(`getMessages(tmpid: ${timestamp}) > listen`);

  const messagesLiveCollection = new MessageLiveCollectionController(params, callback);
  const disposers = messagesLiveCollection.startSubscription();

  const cacheKey = messagesLiveCollection.getCacheKey();

  disposers.push(() => {
    dropFromCache(cacheKey);
  });

  return () => {
    log(`getMessages(tmpid: ${timestamp}) > dispose`);
    disposers.forEach(fn => fn());
  };
};
/* end_public_function */
