import { getActiveClient } from '~/client/api/activeClient';
import { createEventSubscriber } from '~/core/events';
import { persistUnreadCountInfo } from '../utils/persistUnreadCountInfo';

/**
 * ```js
 * import { onFeedMarkerUpdated } from '@amityco/ts-sdk'
 * const dispose = onFeedMarkerUpdated(feedMarker => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.UserFeedMarker} has been updated
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category FeedMarker Events
 */
export const onUserFeedMarkerUpdated = (
  callback: Amity.Listener<Amity.FeedMarker>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  const filter = (payload: Amity.Events['marker.userFeed-updated']) => {
    persistUnreadCountInfo(payload);

    payload.feedMarkers.forEach(feedMarker => {
      callback(feedMarker);
    });
  };

  return createEventSubscriber(
    client,
    'feedMarker/onUserFeedMarkerUpdated',
    'marker.userFeed-updated',
    filter,
  );
};
