import { getActiveClient } from '~/client/api';
import { pullFromCache, upsertInCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { createEventSubscriber } from '~/core/events';
import { preparePostPayload } from '../utils/payload';

/**
 * ```js
 * import { onLocalPostReactionAdded } from '@amityco/ts-sdk'
 * const dispose = onPostReactionAdded(post => {
 *   // ...
 * })
 * ```
 *
 * Fired when a {@link Amity.InternalPost} has been reacted
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Post Events
 */
export const onLocalPostReactionAdded = (
  callback: Amity.Listener<Amity.InternalPost>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  const filter = ({ post }: Amity.Events['local.post.addReaction']) => {
    if (!client.cache) {
      callback(post);
    } else {
      upsertInCache(['post', 'get', post.postId], post);

      callback(post);
    }
  };

  return createEventSubscriber(client, 'local.post.addReaction', 'local.post.addReaction', filter);
};
