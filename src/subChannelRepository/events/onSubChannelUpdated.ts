import { ingestInCache } from '~/cache/api/ingestInCache';
import { getActiveClient } from '~/client/api/activeClient';
import { createEventSubscriber } from '~/core/events';

import { prepareSubChannelPayload } from '../utils';

/**
 * ```js
 * import { onSubChannelUpdated } from '@amityco/ts-sdk'
 * const dispose = onSubChannelUpdated(subChannel => {
 *   // ...
 * })
 * ```
 *
 * Fired when any {@link Amity.SubChannel} have been updated
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Channel Events
 */
export const onSubChannelUpdated = (callback: Amity.Listener<Amity.SubChannel>) => {
  const client = getActiveClient();

  const subChannelChangeHandler = async (rawPayload: Amity.SubChannelPayload) => {
    const payload = await prepareSubChannelPayload(rawPayload);

    ingestInCache(payload);
    callback(payload.messageFeeds[0]);
  };

  const disposers = [
    createEventSubscriber(
      client,
      'onSubChannelUpdated',
      'message-feed.updated',
      subChannelChangeHandler,
    ),
    createEventSubscriber(client, 'onSubChannelUpdated', 'local.message-feed.updated', payload =>
      callback(payload.messageFeeds[0]),
    ),
  ];

  return () => {
    disposers.forEach(fn => fn());
  };
};
