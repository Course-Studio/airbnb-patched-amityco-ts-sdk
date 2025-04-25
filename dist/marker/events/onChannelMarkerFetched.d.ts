/**
 * ```js
 * import { onChannelMarkerFetched } from '@amityco/ts-sdk'
 * const dispose = onChannelMarkerFetched(channelMarker => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.ChannelMarker} has been fetched
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category ChannelMarker Events
 */
export declare const onChannelMarkerFetched: (callback: Amity.Listener<Amity.ChannelMarker>) => Amity.Unsubscriber;
