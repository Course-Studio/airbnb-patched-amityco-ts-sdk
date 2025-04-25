/* eslint-disable no-use-before-define */
import { getActiveClient } from '~/client/api';
import { ENABLE_CACHE_MESSAGE } from '~/utils/constants';
import { dropFromCache } from '~/cache/api';
import { SubChannelLiveCollectionController } from './SubChannelLiveCollectionController';

/* begin_public_function
  id: subchannel.query
*/
/**
 * ```js
 * import { getSubChannels } from '@amityco/ts-sdk';
 *
 * let subChannels = [];
 *
 * const unsubscribe = getSubChannels({ channelId }, response => {
 *   merge(subChannels, response.data);
 * });
 * ```
 *
 * Observe all mutations on a list of {@link Amity.SubChannel}s
 *
 * @param params for querying sub channels
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the sub channels
 *
 * @category SubChannel Live Collection
 */
export const getSubChannels = (
  params: Amity.SubChannelLiveCollection,
  callback: Amity.LiveCollectionCallback<Amity.SubChannel>,
  config?: Amity.LiveCollectionConfig,
) => {
  const { log, cache } = getActiveClient();
  const timestamp = Date.now();
  log(`getSubChannels(tmpid: ${timestamp}) > listen`);

  if (!cache) {
    console.log(ENABLE_CACHE_MESSAGE);
  }

  const subChannelLiveCollection = new SubChannelLiveCollectionController(params, callback);
  const disposers = subChannelLiveCollection.startSubscription();

  const cacheKey = subChannelLiveCollection.getCacheKey();

  disposers.push(() => {
    dropFromCache(cacheKey);
  });

  return () => {
    log(`getSubChannels(tmpid: ${timestamp}) > dispose`);
    disposers.forEach(fn => fn());
  };
};
/* end_public_function */
