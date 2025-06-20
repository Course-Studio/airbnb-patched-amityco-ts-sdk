import { createCommentEventSubscriber } from './utils';

/**
 * ```js
 * import { onCommentDeleted } from '@amityco/ts-sdk'
 * const dispose = onCommentDeleted(comment => {
 *   // ...
 * })
 * ```
 *
 * Fired when a {@link Amity.InternalComment} has been deleted
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Comment Events
 */
export const onCommentDeleted = (
  callback: Amity.Listener<Amity.InternalComment>,
): Amity.Unsubscriber => createCommentEventSubscriber('comment.deleted', callback);
