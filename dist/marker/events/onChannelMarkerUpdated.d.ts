/**
 * ```js
 * import { onChannelMarkerUpdated } from '@amityco/ts-sdk'
 * const dispose = onChannelMarkerUpdated(channelMarker => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.ChannelMarker} has been updated
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category ChannelMarker Events
 */
export declare const onChannelMarkerUpdated: (callback: Amity.Listener<Amity.ChannelMarker>) => Amity.Unsubscriber;
