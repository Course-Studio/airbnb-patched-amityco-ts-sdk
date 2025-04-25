import { pushToCache } from '~/cache/api';
import { shallowClone } from '~/utils/shallowClone';

export function updateChannelCache(
  channel: Amity.StaticInternalChannel,
  params: Partial<Amity.StaticInternalChannel>,
) {
  pushToCache(
    ['channel', 'get', channel.channelId],
    // eslint-disable-next-line prefer-object-spread
    shallowClone(channel, params),
  );
}
