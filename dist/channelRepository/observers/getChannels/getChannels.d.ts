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
export declare const getChannels: (params: Amity.ChannelLiveCollection, callback: Amity.LiveCollectionCallback<Amity.Channel>, config?: Amity.LiveCollectionConfig) => () => void;
