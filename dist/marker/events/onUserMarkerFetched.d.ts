/**
 * ```js
 * import { onUserMarkerFetched } from '@amityco/ts-sdk'
 * const dispose = onUserMarkerFetched(userMarker => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.UserMarker} has been fetched
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category UserMarker Events
 */
export declare const onUserMarkerFetched: (callback: Amity.Listener<Amity.UserMarker[]>) => Amity.Unsubscriber;
export declare const onUserMarkerFetchedLegacy: (callback: Amity.Listener<Amity.UserMarker>) => Amity.Unsubscriber;
