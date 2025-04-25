/**
 * ```js
 * import { getChannelMarker } from '@amityco/ts-sdk'
 * const channelMarkers = await getChannelMarkers(['ch1', 'ch2'])
 * ```
 *
 * @param channelIds the IDs of the {@link Amity.RawChannel} marker to fetch
 * @returns A List of {@link Amity.ChannelMarker} by channelIds
 *
 * @category Channel API
 * @async
 * @private
 */
export declare const getChannelMarkers: (channelIds: Amity.Channel["channelId"][]) => Promise<Amity.Cached<Amity.ChannelMarker[]>>;
