import { getActiveClient } from '~/client/api';
import { pullFromCache, upsertInCache } from '~/cache/api';
import { createEventSubscriber } from '~/core/events';

/**
 * ```js
 * import { onLocalPostReactionRemoved } from '@amityco/ts-sdk'
 * const dispose = onPostReactionRemoved(post => {
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
export const onLocalPostReactionRemoved = (
  callback: Amity.Listener<Amity.InternalPost>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  const filter = ({ post }: Amity.Events['local.post.removeReaction']) => {
    if (!client.cache) {
      callback(post);
    } else {
      upsertInCache(['post', 'get', post.postId], post);

      callback(post);
    }
  };

  return createEventSubscriber(
    client,
    'local.post.removeReaction',
    'local.post.removeReaction',
    filter,
  );
};
