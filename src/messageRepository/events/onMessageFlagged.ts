import { getActiveClient } from '~/client/api/activeClient';
import { createEventSubscriber } from '~/core/events';

import { ingestInCache } from '~/cache/api/ingestInCache';
import { prepareMessagePayload } from '../utils';

/**
 * ```js
 * import { onMessageFlagged } from '@amityco/ts-sdk'
 * const dispose = onMessageFlagged(message => {
 *   // ...
 * })
 * ```
 *
 * Fired when a {@link Amity.Message} has been flagged
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Message Events
 */
export const onMessageFlagged = (
  callback: Amity.Listener<Amity.InternalMessage>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  const filter = async (rawPayload: Amity.MessagePayload) => {
    const payload = await prepareMessagePayload(rawPayload);

    ingestInCache(payload);
    callback(payload.messages[0]);
  };

  return createEventSubscriber(client, 'onMessageFlagged', 'message.flagged', filter);
};
