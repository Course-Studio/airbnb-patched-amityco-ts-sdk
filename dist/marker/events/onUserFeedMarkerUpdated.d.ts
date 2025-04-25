/**
 * ```js
 * import { onFeedMarkerUpdated } from '@amityco/ts-sdk'
 * const dispose = onFeedMarkerUpdated(feedMarker => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.UserFeedMarker} has been updated
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category FeedMarker Events
 */
export declare const onUserFeedMarkerUpdated: (callback: Amity.Listener<Amity.FeedMarker>) => Amity.Unsubscriber;
