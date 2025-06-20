/**
 * ```js
 * import { onMessageUnflagged } from '@amityco/ts-sdk'
 * const dispose = onMessageUnflagged(message => {
 *   // ...
 * })
 * ```
 *
 * Fired when a flag has been removed from a {@link Amity.Message}
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Message Events
 */
export declare const onMessageUnflagged: (callback: Amity.Listener<Amity.InternalMessage>) => Amity.Unsubscriber;
