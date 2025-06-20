/**
 * ```js
 * import { onStreamRecorded } from '@amityco/ts-sdk'
 * const dispose = onStreamRecorded(stream => {
 *   // ...
 * })
 * ```
 *
 * Fired when the recordings of a {@link Amity.InternalStream} are available
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Stream Events
 */
export declare const onStreamRecorded: (callback: Amity.Listener<Amity.InternalStream>) => Amity.Unsubscriber;
