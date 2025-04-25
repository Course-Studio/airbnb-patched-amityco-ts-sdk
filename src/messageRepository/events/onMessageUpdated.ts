import { getActiveClient } from '~/client/api/activeClient';
import { createEventSubscriber } from '~/core/events';

import { ingestInCache } from '~/cache/api/ingestInCache';

import { prepareMessagePayload } from '../utils';

/**
 * ```js
 * import { onMessageUpdated } from '@amityco/ts-sdk'
 * const dispose = onMessageUpdated(message => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.Message} has been updated
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Message Events
 */
export const onMessageUpdated = (
  callback: Amity.Listener<Amity.InternalMessage>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  const filter = async (rawPayload: Amity.MessagePayload) => {
    const payload = await prepareMessagePayload(rawPayload);

    ingestInCache(payload);
    callback(payload.messages[0]);
  };

  const disposers = [
    createEventSubscriber(client, 'onMessageUpdated', 'message.updated', filter),
    createEventSubscriber(client, 'onMessageUpdated', 'local.message.updated', payload =>
      callback(payload.messages[0]),
    ),
  ];

  return () => {
    disposers.forEach(fn => fn());
  };
};
