import { createLocalCommentEventSubscriber } from './utils';

/**
 * ```js
 * import { onCommentDeleteLocal } from '@amityco/ts-sdk'
 * const dispose = onCommentDeleteLocal(comment => {
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
export const onCommentDeleteLocal = (
  callback: Amity.Listener<Amity.InternalComment>,
): Amity.Unsubscriber => createLocalCommentEventSubscriber('local.comment.deleted', callback);
