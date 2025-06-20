/**
 * ```js
 * import { onStreamStopped } from '@amityco/ts-sdk'
 * const dispose = onStreamStopped(stream => {
 *   // ...
 * })
 * ```
 *
 * Fired when a {@link Amity.InternalStream} has stopped airing
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Stream Events
 */
export declare const onStreamStopped: (callback: Amity.Listener<Amity.InternalStream>) => Amity.Unsubscriber;
