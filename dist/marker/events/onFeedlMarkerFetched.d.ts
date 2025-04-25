/**
 * ```js
 * import { onFeedMarkerFetched } from '@amityco/ts-sdk'
 * const dispose = onFeedMarkerFetched(feedMarker => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.FeedMarker} has been fetched
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category FeedMarker Events
 */
export declare const onFeedMarkerFetched: (callback: Amity.Listener<Amity.FeedMarker>) => Amity.Unsubscriber;
