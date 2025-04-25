import { getActiveClient } from '~/client/api/activeClient';
import { createEventSubscriber } from '~/core/events';

/**
 * Internal used only
 *
 * Fired when an {@link Amity.userMessageFeedMarkers} has been resolved by Object Rsesolver
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category MessageMarker Events
 */
export const onUserMessageFeedMarkerResolved = (
  callback: Amity.Listener<Amity.Events['local.userMessageFeedMarkers.resolved']>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  const filter = (payload: Amity.Events['local.userMessageFeedMarkers.resolved']) => {
    callback(payload);
  };

  return createEventSubscriber(
    client,
    'userMessageFeedMarker/onUserMessageFeedMarkerResolved',
    'local.userMessageFeedMarkers.resolved',
    filter,
  );
};
