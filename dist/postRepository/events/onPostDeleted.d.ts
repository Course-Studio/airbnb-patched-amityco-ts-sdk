/**
 * ```js
 * import { onPostDeleted } from '@amityco/ts-sdk'
 * const dispose = onPostDeleted(post => {
 *   // ...
 * })
 * ```
 *
 * Fired when a {@link Amity.InternalPost} has been deleted
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Post Events
 */
export declare const onPostDeleted: (callback: Amity.Listener<Amity.InternalPost>) => Amity.Unsubscriber;
