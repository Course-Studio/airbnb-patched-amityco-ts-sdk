/**
 * ```js
 * import { onMessageDeleted } from '@amityco/ts-sdk'
 * const dispose = onMessageDeleted(message => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.Message} was deleted
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Message Events
 */
export declare const onMessageDeleted: (callback: Amity.Listener<Amity.InternalMessage>) => Amity.Unsubscriber;
