import { getActiveClient } from '~/client/api/activeClient';
import { createEventSubscriber } from '~/core/events';

import { ingestInCache } from '~/cache/api/ingestInCache';

import { prepareChannelPayload } from '../utils';
import { constructChannelDynamicValue } from '../utils/constructChannelDynamicValue';

type CallbackFn = Amity.Listener<Amity.StaticInternalChannel>;
const callbacks: CallbackFn[] = [];
let mainDisposer: (() => void) | null = null;

const dispose = (cb: CallbackFn) => {
  const index = callbacks.indexOf(cb);
  if (index > -1) {
    callbacks.splice(index, 1);
  }
  if (callbacks.length === 0) {
    mainDisposer?.();
  }
};

export const onChannelMuted = (callback: Amity.Listener<Amity.StaticInternalChannel>) => {
  if (callbacks.length === 0) {
    const client = getActiveClient();

    const filter = async (payload: Amity.ChannelPayload) => {
      const data = await prepareChannelPayload(payload);

      ingestInCache(data);
      callbacks.forEach(cb => cb(data.channels[0]));
    };

    mainDisposer = createEventSubscriber(client, 'onChannelMuted', 'channel.setMuted', filter);
  }

  callbacks.push(callback);
  return () => dispose(callback);
};
