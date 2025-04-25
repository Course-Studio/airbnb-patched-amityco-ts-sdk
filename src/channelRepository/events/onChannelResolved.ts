import { getActiveClient } from '~/client/api/activeClient';
import { createEventSubscriber } from '~/core/events';

/**
 * Internal used only
 *
 * Fired when any {@link Amity.Channel} have been resolved by Object resolver
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Channel Events
 */
export const onChannelResolved = (callback: Amity.Listener<Amity.StaticInternalChannel[]>) => {
  const client = getActiveClient();

  const filter = async (payload: Amity.StaticInternalChannel[]) => {
    callback(payload);
  };

  return createEventSubscriber(client, 'onChannelResolved', 'local.channel.resolved', filter);
};
