/**
 * ```js
 * import { onFeedMarkerUpdated } from '@amityco/ts-sdk'
 * const dispose = onFeedMarkerUpdated(feedMarker => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.UserMessageFeedMarkerPayload} has been updated
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category FeedMarker Events
 */
export declare const onUserFeedMarkerFetched: (callback: Amity.Listener<Amity.UserMessageFeedMarkerPayload>) => Amity.Unsubscriber;
//# sourceMappingURL=onUserFeedMarkerFetched.d.ts.map