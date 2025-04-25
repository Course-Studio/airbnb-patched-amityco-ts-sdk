import { getActiveClient } from '~/client/api/activeClient';
import { createEventSubscriber } from '~/core/events';

/**
 * ```js
 * import { onSubChannelMarkerFetched } from '@amityco/ts-sdk'
 * const dispose = onSubChannelMarkerFetched(subChannelMarker => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.SubChannelMarker} has been fetched
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category SubChannelMarker Events
 */
export const onSubChannelMarkerFetched = (
  callback: Amity.Listener<Amity.SubChannelMarker>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  const filter = (payload: Amity.Events['local.subChannelMarker.fetched']) => {
    payload.userFeedMarkers.forEach(callback);
  };

  return createEventSubscriber(
    client,
    'subChannelMarker/onSubChannelMarkerFetched',
    'local.subChannelMarker.fetched',
    filter,
  );
};
