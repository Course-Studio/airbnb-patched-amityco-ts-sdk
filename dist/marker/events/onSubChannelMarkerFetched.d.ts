/**
 * ```js
 * import { onSubChannelMarkerFetched } from '@amityco/ts-sdk'
 * const dispose = onSubChannelMarkerFetched(subChannelMarker => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.SubChannelMarker} has been fetched
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category SubChannelMarker Events
 */
export declare const onSubChannelMarkerFetched: (callback: Amity.Listener<Amity.SubChannelMarker>) => Amity.Unsubscriber;
