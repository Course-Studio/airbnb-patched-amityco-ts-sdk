/**
 * ```js
 * import { onCommentUnflagged } from '@amityco/ts-sdk'
 * const dispose = onCommentUnflagged(comment => {
 *   // ...
 * })
 * ```
 *
 * Fired when a flag has been removed from a {@link Amity.InternalComment}
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Comment Events
 */
export declare const onCommentUnflagged: (callback: Amity.Listener<Amity.InternalComment>) => Amity.Unsubscriber;
