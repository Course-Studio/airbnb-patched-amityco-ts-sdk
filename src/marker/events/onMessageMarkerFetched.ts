import { getActiveClient } from '~/client/api/activeClient';
import { createEventSubscriber } from '~/core/events';

/**
 * ```js
 * import { onMessageMarkerFetched } from '@amityco/ts-sdk'
 * const dispose = onMessageMarkerFetched(messageMarker => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.MessageMarker} has been fetched
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category MessageMarker Events
 */
export const onMessageMarkerFetched = (
  callback: Amity.Listener<Amity.MessageMarker>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  const filter = (payload: Amity.Events['local.messageMarker.fetched']) => {
    callback(payload.contentMarkers[0]);
  };

  return createEventSubscriber(
    client,
    'messageMarker/onMessageMarkerFetched',
    'local.messageMarker.fetched',
    filter,
  );
};
