/**
 * ```js
 * import { onMessageMarked } from '@amityco/ts-sdk'
 * const dispose = onMessageMarked(markedMessage => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.Message} has been mark read/delivered
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Marker Events
 */
export declare const onMessageMarked: (callback: Amity.Listener<Amity.MessageMarker>) => Amity.Unsubscriber;
