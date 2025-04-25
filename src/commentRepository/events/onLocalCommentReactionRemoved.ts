import { getActiveClient } from '~/client/api';
import { pullFromCache, upsertInCache } from '~/cache/api';
import { createEventSubscriber } from '~/core/events';
import { commentLinkedObject } from '~/utils/linkedObject/commentLinkedObject';

/**
 * ```js
 * import { onLocalCommentReactionRemoved } from '@amityco/ts-sdk'
 * const dispose = onLocalCommentReactionRemoved(comment => {
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
export const onLocalCommentReactionRemoved = (
  callback: Amity.Listener<Amity.InternalComment>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  const filter = ({ comment }: Amity.Events['local.comment.removeReaction']) => {
    if (!client.cache) {
      callback(comment);
    } else {
      upsertInCache(['comment', 'get', comment.commentId], comment);

      callback(commentLinkedObject(comment));
    }
  };

  return createEventSubscriber(
    client,
    'local.comment.removeReaction',
    'local.comment.removeReaction',
    filter,
  );
};
