/**
 * ```js
 * import { onPostDeclined } from '@amityco/ts-sdk'
 * const dispose = onPostDeclined(post => {
 *   // ...
 * })
 * ```
 *
 * Fired when a {@link Amity.InternalPost} has been updated
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Post Events
 */
export declare const onPostDeclined: (callback: Amity.Listener<Amity.InternalPost>) => Amity.Unsubscriber;
