/**
 * ```js
 * import { onLocalPostReactionAdded } from '@amityco/ts-sdk'
 * const dispose = onPostReactionAdded(post => {
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
export declare const onLocalPostReactionAdded: (callback: Amity.Listener<Amity.InternalPost>) => Amity.Unsubscriber;
