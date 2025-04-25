/**
 * ```js
 * import { onStreamFlagged } from '@amityco/ts-sdk'
 * const dispose = onStreamFlagged(stream => {
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
export declare const onStreamFlagged: (callback: Amity.Listener<Amity.InternalStream>) => Amity.Unsubscriber;
