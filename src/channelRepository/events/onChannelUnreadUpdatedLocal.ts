import { getActiveClient } from '~/client/api/activeClient';
import { createEventSubscriber } from '~/core/events';

/**
 * Internal used only
 *
 * Fired when an {@link Amity.ChannelUnread} has been updated.
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Channel Events
 */
export const onChannelUnreadUpdatedLocal = (
  callback: Amity.Listener<Amity.Events['local.channelUnread.updated']>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  const filter = (payload: Amity.Events['local.channelUnread.updated']) => {
    callback(payload);
  };

  return createEventSubscriber(
    client,
    'channel/onChannelUnreadUpdatedLocal',
    'local.channelUnread.updated',
    filter,
  );
};
