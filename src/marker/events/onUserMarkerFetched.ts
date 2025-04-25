import { getActiveClient } from '~/client/api/activeClient';
import { createEventSubscriber } from '~/core/events';

/**
 * ```js
 * import { onUserMarkerFetched } from '@amityco/ts-sdk'
 * const dispose = onUserMarkerFetched(userMarker => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.UserMarker} has been fetched
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category UserMarker Events
 */
export const onUserMarkerFetched = (
  callback: Amity.Listener<Amity.UserMarker[]>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  const filter = (payload: Amity.Events['local.userMarker.fetched']) => {
    callback(payload.userMarkers);
  };

  return createEventSubscriber(
    client,
    'userMarker/onUserMarkerFetched',
    'local.userMarker.fetched',
    filter,
  );
};

export const onUserMarkerFetchedLegacy = (
  callback: Amity.Listener<Amity.UserMarker>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  const filter = (payload: Amity.Events['local.userMarker.fetched']) => {
    callback(payload.userMarkers[0]);
  };

  return createEventSubscriber(
    client,
    'userMarker/onUserMarkerFetched',
    'local.userMarker.fetched',
    filter,
  );
};
