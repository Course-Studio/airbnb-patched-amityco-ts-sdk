import { getActiveClient } from '~/client/api/activeClient';
import { createEventSubscriber } from '~/core/events';

/**
 * ```js
 * import { onSubChannelMarkerUpdated } from '@amityco/ts-sdk'
 * const dispose = onSubChannelMarkerUpdated(subChannelMarker => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.SubChannelMarker} has been updated
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category SubChannelMarker Events
 */
export const onSubChannelMarkerUpdated = (
  callback: Amity.Listener<Amity.SubChannelMarker[]>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  const filter = (payload: Amity.Events['local.subChannelMarker.updated']) => {
    callback(payload.userFeedMarkers);
  };

  return createEventSubscriber(
    client,
    'subChannelMarker/onSubChannelMarkerUpdated',
    'local.subChannelMarker.updated',
    filter,
  );
};
