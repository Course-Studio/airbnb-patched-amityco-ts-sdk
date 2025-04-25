/**
 * ```js
 * import { getMessageMarkers } from '@amityco/ts-sdk'
 * const messageMarkers = await getMessageMarkers(['sch1', 'sch2'])
 * ```
 *
 * Fetches a list of {@link Amity.MessageMarker} by messageIds
 *
 * @param messageIds the feed IDs of the {@link Amity.RawMessage} marker to fetch
 * @returns A list of {@link Amity.MessageMarker} by messageIds
 *
 * @category Channel API
 * @async
 * @private
 */
export declare const getMessageMarkers: (messageIds: Amity.RawMessage["messageFeedId"][]) => Promise<Amity.Cached<Amity.MessageMarker[]>>;
