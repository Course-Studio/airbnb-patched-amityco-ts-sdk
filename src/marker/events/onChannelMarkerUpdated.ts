import { getActiveClient } from '~/client/api/activeClient';
import { createEventSubscriber } from '~/core/events';

/**
 * ```js
 * import { onChannelMarkerUpdated } from '@amityco/ts-sdk'
 * const dispose = onChannelMarkerUpdated(channelMarker => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.ChannelMarker} has been updated
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category ChannelMarker Events
 */
export const onChannelMarkerUpdated = (
  callback: Amity.Listener<Amity.ChannelMarker>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  const filter = (payload: Amity.Events['local.channelMarker.updated']) => {
    callback(payload.userEntityMarkers[0]);
  };

  return createEventSubscriber(
    client,
    'channelMarker/onChannelMarkerUpdated',
    'local.channelMarker.updated',
    filter,
  );
};
