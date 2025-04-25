import { getActiveClient } from '~/client/api/activeClient';
import { createEventSubscriber } from '~/core/events';

/**
 * Internal used only
 *
 * Fired when an {@link Amity.channelUnreadInfo} has been updated.
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category ChannelMarker Events
 */
export const onChannelUnreadInfoUpdatedLocal = (
  callback: Amity.Listener<Amity.Events['local.channelUnreadInfo.updated']>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  const filter = (payload: Amity.Events['local.channelUnreadInfo.updated']) => {
    callback(payload);
  };

  return createEventSubscriber(
    client,
    'channelMarker/onChannelUnreadInfoUpdatedLocal',
    'local.channelUnreadInfo.updated',
    filter,
  );
};
