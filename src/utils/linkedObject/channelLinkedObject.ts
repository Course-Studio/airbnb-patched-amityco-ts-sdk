import { markAsRead } from '~/channelRepository/internalApi/markAsRead';
import { shallowClone } from '../shallowClone';

export const channelLinkedObject = (channel: Amity.InternalChannel): Amity.Channel => {
  return shallowClone(channel, {
    markAsRead: () => markAsRead(channel.channelInternalId),
  });
};
