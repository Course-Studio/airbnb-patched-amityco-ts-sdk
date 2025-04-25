import { getActiveClient } from '~/client/api';
import { pullFromCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { createEventSubscriber } from '~/core/events';
import { prepareReactionPayloadFromEvent } from '~/reactionRepository/utils';

/**
 * ```js
 * import { onPostReactionRemoved } from '@amityco/ts-sdk'
 * const dispose = onPostReactionRemoved(post => {
 *   // ...
 * })
 * ```
 *
 * Fired when a reaction has been removed from a {@link Amity.InternalPost}
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Post Events
 */
export const onPostReactionRemoved = (
  callback: Amity.Listener<Amity.InternalPost>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  const filter = (payload: Amity.Events['post.removeReaction']) => {
    if (!client.cache) {
      callback(payload.posts[0]);
    } else {
      const processed = prepareReactionPayloadFromEvent('post.removeReaction', payload);
      const { reactor, ...postPayload } = processed;

      ingestInCache(postPayload as Amity.ProcessedPostPayload);

      const post = pullFromCache<Amity.InternalPost>(['post', 'get', payload.posts[0].postId])!;

      callback(post.data);
    }
  };

  return createEventSubscriber(client, 'post.removeReaction', 'post.removeReaction', filter);
};
