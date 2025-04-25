import { pushToCache } from '~/cache/api';
import { shallowClone } from '~/utils/shallowClone';

export function updateSubChannelCache(
  subChannelId: string,
  subChannel: Amity.SubChannel | Record<string, never>,
  params: Partial<Amity.SubChannel>,
) {
  pushToCache(
    ['subChannel', 'get', subChannelId],
    // eslint-disable-next-line prefer-object-spread
    shallowClone(subChannel, params),
  );
}
