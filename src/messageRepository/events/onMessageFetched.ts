import { getActiveClient } from '~/client/api';
import { createEventSubscriber } from '~/core/events';

import { ingestInCache } from '~/cache/api/ingestInCache';

/**
 * ```js
 * import { onMessageFetched } from '@amityco/ts-sdk'
 * const dispose = onMessageFetched(message => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.Message} has been fetched
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Message Events
 */
export const onMessageFetched = (
  callback: Amity.Listener<Amity.InternalMessage>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  const filter = (payload: Amity.Events['local.message.fetched']) => {
    ingestInCache(payload);
    callback(payload.messages[0]);
  };

  return createEventSubscriber(client, 'message/onMessageFetched', 'local.message.fetched', filter);
};
