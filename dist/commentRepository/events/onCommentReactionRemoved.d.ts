/**
 * ```js
 * import { onCommentReactionRemoved } from '@amityco/ts-sdk'
 * const dispose = onCommentReactionRemoved(comment => {
 *   // ...
 * })
 * ```
 *
 * Fired when a reaction has been removed from a {@link Amity.InternalComment}
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Comment Events
 */
export declare const onCommentReactionRemoved: (callback: Amity.Listener<Amity.InternalComment>) => Amity.Unsubscriber;
