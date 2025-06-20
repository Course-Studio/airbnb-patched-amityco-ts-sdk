/**
 * ```js
 * import { onMessageFetched } from '@amityco/ts-sdk'
 * const dispose = onMessageFetched(message => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.Message} has been fetched
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Message Events
 */
export declare const onMessageFetched: (callback: Amity.Listener<Amity.InternalMessage>) => Amity.Unsubscriber;
