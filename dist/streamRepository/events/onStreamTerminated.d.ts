/**
 * ```js
 * import { onStreamTerminated } from '@amityco/ts-sdk'
 * const dispose = onStreamTerminated(stream => {
 *   // ...
 * })
 * ```
 *
 * Fired when a {@link Amity.InternalStream} has started airing
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Stream Events
 */
export declare const onStreamTerminated: (callback: Amity.Listener<Amity.InternalStream>) => Amity.Unsubscriber;
