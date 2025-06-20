import { createCommentEventSubscriber } from './utils';

/**
 * ```js
 * import { onCommentUpdated } from '@amityco/ts-sdk'
 * const dispose = onCommentUpdated(comment => {
 *   // ...
 * })
 * ```
 *
 * Fired when a {@link Amity.InternalComment} has been updated
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Comment Events
 */
export const onCommentUpdated = (
  callback: Amity.Listener<Amity.InternalComment>,
): Amity.Unsubscriber => createCommentEventSubscriber('comment.updated', callback);
