/**
 * ```js
 * import { onCommentReactionAdded } from '@amityco/ts-sdk'
 * const dispose = onCommentReactionAdded(comment => {
 *   // ...
 * })
 * ```
 *
 * Fired when a {@link Amity.InternalComment} has been reacted
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Comment Events
 */
export declare const onCommentReactionAdded: (callback: Amity.Listener<Amity.InternalComment>) => Amity.Unsubscriber;
