import { getActiveClient } from '~/client/api/activeClient';
import { createEventSubscriber } from '~/core/events';

/**
 * ```js
 * import { onFeedMarkerFetched } from '@amityco/ts-sdk'
 * const dispose = onFeedMarkerFetched(feedMarker => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.FeedMarker} has been fetched
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category FeedMarker Events
 */
export const onFeedMarkerFetched = (
  callback: Amity.Listener<Amity.FeedMarker>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  const filter = (payload: Amity.Events['local.feedMarker.fetched']) => {
    callback(payload.feedMarkers[0]);
  };

  return createEventSubscriber(
    client,
    'feedMarker/onFeedMarkerFetched',
    'local.feedMarker.fetched',
    filter,
  );
};
