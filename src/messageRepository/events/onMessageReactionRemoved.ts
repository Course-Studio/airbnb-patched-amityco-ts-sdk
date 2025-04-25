import { getActiveClient } from '~/client/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { createEventSubscriber } from '~/core/events';
import { prepareMessagePayload } from '../utils';

/**
 * ```js
 * import { onMessageReactionRemoved } from '@amityco/ts-sdk';
 *
 * const unsubscribe = onMessageReactionRemoved(message => {
 *   // ...
 * });
 * ```
 *
 * Fired when a reaction has been removed from a {@link Amity.Message}
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Post Events
 */
export const onMessageReactionRemoved = (
  callback: Amity.Listener<Amity.InternalMessage>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  const filter = async (rawPayload: Amity.MessagePayload) => {
    const payload = await prepareMessagePayload(rawPayload, 'message.reactionRemoved');

    ingestInCache(payload);
    callback(payload.messages[0]);
  };

  return createEventSubscriber(
    client,
    'onMessageReactionRemoved',
    'message.reactionRemoved',
    filter,
  );
};
