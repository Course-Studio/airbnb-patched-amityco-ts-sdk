import { getActiveClient } from '~/client/api/activeClient';
import { createEventSubscriber } from '~/core/events';

/**
 * ```js
 * import { onChannelMarkerFetched } from '@amityco/ts-sdk'
 * const dispose = onChannelMarkerFetched(channelMarker => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.ChannelMarker} has been fetched
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category ChannelMarker Events
 */
export const onChannelMarkerFetched = (
  callback: Amity.Listener<Amity.ChannelMarker>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  const filter = (payload: Amity.Events['local.channelMarker.fetched']) => {
    payload.userEntityMarkers.forEach(marker => {
      callback(marker);
    });
  };

  return createEventSubscriber(
    client,
    'channelMarker/onChannelMarkerFetched',
    'local.channelMarker.fetched',
    filter,
  );
};
