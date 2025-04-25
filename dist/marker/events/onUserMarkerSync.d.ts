/**
 * ```js
 * import { onUserMarkerSync } from '@amityco/ts-sdk'
 * const dispose = onUserMarkerSync(UserMarker => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.UserMarker} has been sync
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category UserMarker Events
 */
export declare const onUserMarkerSync: (callback: Amity.Listener<Amity.UserMarker>) => Amity.Unsubscriber;
