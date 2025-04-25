import { getActiveClient } from '~/client/api';
import { pullFromCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { createEventSubscriber } from '~/core/events';

import { LinkedObject } from '~/utils/linkedObject';
import { prepareReactionPayloadFromEvent } from '~/reactionRepository/utils';

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
export const onCommentReactionRemoved = (
  callback: Amity.Listener<Amity.InternalComment>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  const filter = (payload: Amity.CommentPayload & { reactor: Amity.InternalReactor }) => {
    if (!client.cache) {
      callback(LinkedObject.comment(payload.comments[0]));
    } else {
      const processed = prepareReactionPayloadFromEvent('comment.removeReaction', payload);
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

  return createEventSubscriber(client, 'comment.removeReaction', 'comment.removeReaction', filter);
};
