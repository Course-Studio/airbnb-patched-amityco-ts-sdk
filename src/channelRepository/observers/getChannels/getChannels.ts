/* eslint-disable no-use-before-define */

import { dropFromCache } from '~/cache/api';
import { getActiveClient } from '~/client/api';
import { ENABLE_CACHE_MESSAGE } from '~/utils/constants';
import { ChannelLiveCollectionController } from './ChannelLiveCollectionController';

/* begin_public_function
  id: channel.query
*/
/**
 * ```js
 * import { getChannels } from '@amityco/ts-sdk'
 *
 * let channels = []
 * const unsub = getChannels({
 *   displayName: Amity.Channel['displayName'],
 * }, response => merge(channels, response.data))
 * ```
 *
 * Observe all mutations on a list of {@link Amity.Channel}s
 *
 * @param params for querying channels
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the channels
 *
 * @category Channel Live Collection
 */
export const getChannels = (
  params: Amity.ChannelLiveCollection,
  callback: Amity.LiveCollectionCallback<Amity.Channel>,
  config?: Amity.LiveCollectionConfig,
) => {
  const { log, cache, userId } = getActiveClient();

  if (!cache) {
    console.log(ENABLE_CACHE_MESSAGE);
  }

  const timestamp = Date.now();
  log(`getChannels(tmpid: ${timestamp}) > listen`);

  const channelLiveCollection = new ChannelLiveCollectionController(params, callback);
  const disposers = channelLiveCollection.startSubscription();
  const cacheKey = channelLiveCollection.getCacheKey();

  disposers.push(() => {
    dropFromCache(cacheKey);
  });

  return () => {
    log(`getChannels(tmpid: ${timestamp}) > dispose`);
    disposers.forEach(fn => fn());
  };
};
/* end_public_function */
