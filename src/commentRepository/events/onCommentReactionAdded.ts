import { getActiveClient } from '~/client/api';
import { pullFromCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { createEventSubscriber } from '~/core/events';
import { prepareReactionPayloadFromEvent } from '~/reactionRepository/utils';
import { LinkedObject } from '~/utils/linkedObject';

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
export const onCommentReactionAdded = (
  callback: Amity.Listener<Amity.InternalComment>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  const filter = (payload: Amity.CommentPayload & { reactor: Amity.InternalReactor }) => {
    if (!client.cache) {
      callback(LinkedObject.comment(payload.comments[0]));
    } else {
      const processed = prepareReactionPayloadFromEvent('comment.addReaction', payload);
      const { reactor, ...commentPayload } = processed;

      ingestInCache(commentPayload as Amity.CommentPayload);

      const comment = pullFromCache<Amity.InternalComment>([
        'comment',
        'get',
        payload.comments[0].commentId,
      ])!;

      callback(LinkedObject.comment(comment.data));
    }
  };

  return createEventSubscriber(client, 'comment.addReaction', 'comment.addReaction', filter);
};
