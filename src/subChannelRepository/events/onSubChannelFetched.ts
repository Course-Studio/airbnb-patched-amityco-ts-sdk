import { getActiveClient } from '~/client/api/activeClient';
import { createEventSubscriber } from '~/core/events';

/** @hidden */
export const onSubChannelFetched = (callback: Amity.Listener<Amity.SubChannel>) => {
  return createEventSubscriber(
    getActiveClient(),
    'onSubChannelFetched',
    'local.message-feed.fetched',
    payload => callback(payload.messageFeeds[0]),
  );
};
