/**
 * ```js
 * import { onPostReactionRemoved } from '@amityco/ts-sdk'
 * const dispose = onPostReactionRemoved(post => {
 *   // ...
 * })
 * ```
 *
 * Fired when a reaction has been removed from a {@link Amity.InternalPost}
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Post Events
 */
export declare const onPostReactionRemoved: (callback: Amity.Listener<Amity.InternalPost>) => Amity.Unsubscriber;
