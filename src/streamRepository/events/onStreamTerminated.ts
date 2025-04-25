import { getActiveClient } from '~/client/api';
import { createEventSubscriber } from '~/core/events';

import { ingestInCache } from '~/cache/api/ingestInCache';

/**
 * ```js
 * import { onStreamTerminated } from '@amityco/ts-sdk'
 * const dispose = onStreamTerminated(stream => {
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
export const onStreamTerminated = (
  callback: Amity.Listener<Amity.InternalStream>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  const filter = (payload: Amity.StreamPayload) => {
    ingestInCache(payload);
    callback(payload.videoStreamings[0]);
  };

  return createEventSubscriber(
    client,
    'stream/onStreamTerminated',
    'video-streaming.didTerminate',
    filter,
  );
};
