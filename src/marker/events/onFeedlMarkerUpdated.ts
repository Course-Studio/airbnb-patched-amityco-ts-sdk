import { ingestInCache } from '~/cache/api/ingestInCache';
import { getActiveClient } from '~/client/api/activeClient';
import { createEventSubscriber } from '~/core/events';

/**
 * ```js
 * import { onFeedMarkerUpdated } from '@amityco/ts-sdk'
 * const dispose = onFeedMarkerUpdated(feedMarker => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.FeedMarker} has been updated
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category FeedMarker Events
 */
export const onFeedMarkerUpdated = (
  callback: Amity.Listener<Amity.FeedMarker>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  const filter = (payload: Amity.Events['marker.feed-updated']) => {
    ingestInCache(payload);
    callback(payload.feedMarkers[0]);
  };

  return createEventSubscriber(
    client,
    'feedMarker/onFeedMarkerUpdated',
    'marker.feed-updated',
    filter,
  );
};
