import { ingestInCache } from '~/cache/api/ingestInCache';
import { getActiveClient } from '~/client/api/activeClient';
import { createEventSubscriber } from '~/core/events';
import { convertChannelMarkerResponse, convertSubChannelMarkerResponse } from '~/utils/marker';

/**
 * ```js
 * import { onUserMarkerSync } from '@amityco/ts-sdk'
 * const dispose = onUserMarkerSync(UserMarker => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.UserMarker} has been sync
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category UserMarker Events
 */
export const onUserMarkerSync = (
  callback: Amity.Listener<Amity.UserMarker>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  const filter = (payload: Amity.Events['marker.user-sync']) => {
    const {
      userMarkers,
      userEntityMarkers: userEntityMarkersPayload,
      userFeedMarkers: userFeedMarkersPayload,
      ...rest
    } = payload;

    const userEntityMarkers = convertChannelMarkerResponse(userEntityMarkersPayload);
    const userFeedMarker = convertSubChannelMarkerResponse(userFeedMarkersPayload);

    ingestInCache({ userMarkers, userEntityMarkers, userFeedMarker, ...rest });
    callback(userMarkers[0]);
  };

  return createEventSubscriber(client, 'UserMarker/onUserMarkerSync', 'marker.user-sync', filter);
};
