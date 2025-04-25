/**
 * ```js
 * import { onLocalPostReactionRemoved } from '@amityco/ts-sdk'
 * const dispose = onPostReactionRemoved(post => {
 *   // ...
 * })
 * ```
 *
 * Fired when a {@link Amity.InternalPost} has been reacted
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Post Events
 */
export declare const onLocalPostReactionRemoved: (callback: Amity.Listener<Amity.InternalPost>) => Amity.Unsubscriber;
