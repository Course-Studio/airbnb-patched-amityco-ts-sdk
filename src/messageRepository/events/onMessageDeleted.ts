import { getActiveClient } from '~/client/api/activeClient';
import { createEventSubscriber } from '~/core/events';

import { ingestInCache } from '~/cache/api/ingestInCache';
import { prepareMessagePayload } from '../utils';

/**
 * ```js
 * import { onMessageDeleted } from '@amityco/ts-sdk'
 * const dispose = onMessageDeleted(message => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.Message} was deleted
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Message Events
 */
export const onMessageDeleted = (
  callback: Amity.Listener<Amity.InternalMessage>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  const filter = async (rawPayload: Amity.MessagePayload) => {
    const payload = await prepareMessagePayload(rawPayload);

    ingestInCache(payload);
    callback(payload.messages[0]);
  };

  const disposers = [
    createEventSubscriber(client, 'message/onMessageDeleted', 'message.deleted', filter),
    createEventSubscriber(client, 'message/onMessageDeleted', 'local.message.deleted', payload =>
      callback(payload.messages[0]),
    ),
  ];

  return () => {
    disposers.forEach(fn => fn());
  };
};
