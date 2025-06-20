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
export declare const getSubChannels: (params: Amity.SubChannelLiveCollection, callback: Amity.LiveCollectionCallback<Amity.SubChannel>, config?: Amity.LiveCollectionConfig) => () => void;
