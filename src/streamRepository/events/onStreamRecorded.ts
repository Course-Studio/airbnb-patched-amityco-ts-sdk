import { getActiveClient } from '~/client/api';
import { createEventSubscriber } from '~/core/events';

import { ingestInCache } from '~/cache/api/ingestInCache';

/**
 * ```js
 * import { onStreamRecorded } from '@amityco/ts-sdk'
 * const dispose = onStreamRecorded(stream => {
 *   // ...
 * })
 * ```
 *
 * Fired when the recordings of a {@link Amity.InternalStream} are available
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Stream Events
 */
export const onStreamRecorded = (
  callback: Amity.Listener<Amity.InternalStream>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  const filter = (payload: Amity.StreamPayload) => {
    ingestInCache(payload);
    callback(payload.videoStreamings[0]);
  };

  return createEventSubscriber(
    client,
    'stream/onStreamRecorded',
    'video-streaming.didRecord',
    filter,
  );
};
