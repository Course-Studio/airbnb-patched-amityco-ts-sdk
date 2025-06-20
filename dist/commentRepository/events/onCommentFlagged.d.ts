/**
 * ```js
 * import { onCommentFlagged } from '@amityco/ts-sdk'
 * const dispose = onCommentFlagged(comment => {
 *   // ...
 * })
 * ```
 *
 * Fired when a {@link Amity.InternalComment} has been flagged
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Comment Events
 */
export declare const onCommentFlagged: (callback: Amity.Listener<Amity.InternalComment>) => Amity.Unsubscriber;
