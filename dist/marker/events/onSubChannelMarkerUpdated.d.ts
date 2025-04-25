/**
 * ```js
 * import { onSubChannelMarkerUpdated } from '@amityco/ts-sdk'
 * const dispose = onSubChannelMarkerUpdated(subChannelMarker => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.SubChannelMarker} has been updated
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category SubChannelMarker Events
 */
export declare const onSubChannelMarkerUpdated: (callback: Amity.Listener<Amity.SubChannelMarker[]>) => Amity.Unsubscriber;
//# sourceMappingURL=onSubChannelMarkerUpdated.d.ts.map