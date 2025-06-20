/**
 * ```js
 * import { onMessageUpdated } from '@amityco/ts-sdk'
 * const dispose = onMessageUpdated(message => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.Message} has been updated
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Message Events
 */
export declare const onMessageUpdated: (callback: Amity.Listener<Amity.InternalMessage>) => Amity.Unsubscriber;
