/**
 * ```js
 * import { onPostUnflagged } from '@amityco/ts-sdk'
 * const dispose = onPostUnflagged(post => {
 *   // ...
 * })
 * ```
 *
 * Fired when a flag has been removed from a {@link Amity.InternalPost}
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Post Events
 */
export declare const onPostUnflagged: (callback: Amity.Listener<Amity.InternalPost>) => Amity.Unsubscriber;
