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
 * Fired when an {@link Amity.UserMessageFeedMarkerPayload} has been updated
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category FeedMarker Events
 */
export const onUserFeedMarkerFetched = (
  callback: Amity.Listener<Amity.UserMessageFeedMarkerPayload>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  const filter = (payload: Amity.Events['local.userMessageFeedMarker.fetched']) => {
    // update sub channel unread info and channel unread info in cache
    persistUnreadCountInfo(payload.userMessageFeedMarker);
    callback(payload.userMessageFeedMarker);
  };

  return createEventSubscriber(
    client,
    'feedMarker/onUserFeedMarkerFetched',
    'local.userMessageFeedMarker.fetched',
    filter,
  );
};
