import { getActiveClient } from '~/client/api';
import { createEventSubscriber } from '~/core/events';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { prepareMessagePayload } from '../utils';

/**
 * ```js
 * import { onMessageUnflagged } from '@amityco/ts-sdk'
 * const dispose = onMessageUnflagged(message => {
 *   // ...
 * })
 * ```
 *
 * Fired when a flag has been removed from a {@link Amity.Message}
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Message Events
 */
export const onMessageUnflagged = (
  callback: Amity.Listener<Amity.InternalMessage>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  const filter = async (rawPayload: Amity.MessagePayload) => {
    const payload = await prepareMessagePayload(rawPayload);

    ingestInCache(payload);
    callback(payload.messages[0]);
  };

  return createEventSubscriber(client, 'onMessageUnflagged', 'message.unflagged', filter);
};
