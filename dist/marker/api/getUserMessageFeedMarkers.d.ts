/**
 * ```js
 * import { getSubChannelMarkers } from '@amityco/ts-sdk'
 * const subChannelMarkers = await getSubChannelMarkers(['sch1', 'sch2'])
 * ```
 *
 * Fetches a paginable list of {@link Amity.SubChannelMarker} objects
 *
 * @param messageFeedIds the feed IDs of the {@link Amity.RawSubChannel} marker to fetch
 * @param page
 * @returns A page of {@link Amity.SubChannelMarker} objects
 *
 * @category Channel API
 * @async
 * @private
 */
export declare const getUserMessageFeedMakers: (channelIds: Amity.RawChannel['channelId'][]) => Promise<Amity.UserMessageFeedMarkerPayload>;
