import { getActiveClient } from '~/client/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { createEventSubscriber } from '~/core/events';
import { prepareMessagePayload } from '../utils';

/**
 * ```js
 * import { onMessageReactionAdded } from '@amityco/ts-sdk';
 *
 * const unsubscribe = onMessageReactionAdded(message => {
 *   // ...
 * });
 * ```
 *
 * Fired when a {@link Amity.Message} has been reacted
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Post Events
 */
export const onMessageReactionAdded = (
  callback: Amity.Listener<Amity.InternalMessage>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  const filter = async (rawPayload: Amity.MessagePayload) => {
    const payload = await prepareMessagePayload(rawPayload, 'message.reactionAdded');

    ingestInCache(payload);
    callback(payload.messages[0]);
  };

  return createEventSubscriber(client, 'onMessageReactionAdded', 'message.reactionAdded', filter);
};
