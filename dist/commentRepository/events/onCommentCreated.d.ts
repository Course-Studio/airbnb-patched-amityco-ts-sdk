/**
 * ```js
 * import { onCommentCreated } from '@amityco/ts-sdk'
 * const dispose = onCommentCreated(comment => {
 *   // ...
 * })
 * ```
 *
 * Fired when a {@link Amity.InternalComment} has been created
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Comment Events
 */
export declare const onCommentCreated: (callback: Amity.Listener<Amity.InternalComment>) => Amity.Unsubscriber;
