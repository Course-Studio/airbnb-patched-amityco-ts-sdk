import { getActiveClient } from '~/client/api';
import { createEventSubscriber } from '~/core/events';

import { ingestInCache } from '~/cache/api/ingestInCache';

/**
 * ```js
 * import { onStreamFlagged } from '@amityco/ts-sdk'
 * const dispose = onStreamFlagged(stream => {
 *   // ...
 * })
 * ```
 *
 * Fired when a {@link Amity.InternalStream} has started airing
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Stream Events
 */
export const onStreamFlagged = (
  callback: Amity.Listener<Amity.InternalStream>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  const filter = (payload: Amity.StreamPayload) => {
    ingestInCache(payload);
    callback(payload.videoStreamings[0]);
  };

  return createEventSubscriber(client, 'stream/onStreamFlagged', 'video-streaming.didFlag', filter);
};
