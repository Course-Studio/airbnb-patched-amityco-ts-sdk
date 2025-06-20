/**
 * ```js
 * import { onMessageFlagged } from '@amityco/ts-sdk'
 * const dispose = onMessageFlagged(message => {
 *   // ...
 * })
 * ```
 *
 * Fired when a {@link Amity.Message} has been flagged
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Message Events
 */
export declare const onMessageFlagged: (callback: Amity.Listener<Amity.InternalMessage>) => Amity.Unsubscriber;
