import { getActiveClient } from '~/client/api/activeClient';
import { createEventSubscriber } from '~/core/events';
import { ingestInCache } from '~/cache/api/ingestInCache';

import { prepareChannelPayload } from '../utils';

type CallbackFn = Amity.Listener<Amity.StaticInternalChannel>;
const callbacks: CallbackFn[] = [];
const mainDisposers: (() => void)[] = [];

const dispose = (cb: CallbackFn) => {
  const index = callbacks.indexOf(cb);
  if (index > -1) {
    callbacks.splice(index, 1);
  }
  if (callbacks.length === 0) {
    mainDisposers.forEach(fn => fn());
  }
};

export const onChannelUpdated = (callback: Amity.Listener<Amity.StaticInternalChannel>) => {
  const client = getActiveClient();

  if (callbacks.length === 0) {
    const filter = async (payload: Amity.ChannelPayload) => {
      const data = await prepareChannelPayload(payload);

      ingestInCache(data);
      callbacks.forEach(cb => cb(data.channels[0]));
    };

    mainDisposers.push(
      createEventSubscriber(client, 'onChannelUpdated', 'channel.updated', filter),
    );

    mainDisposers.push(
      createEventSubscriber(client, 'onChannelUpdated', 'local.channel.updated', payload =>
        callbacks.forEach(cb => cb(payload.channels[0])),
      ),
    );
  }

  callbacks.push(callback);
  return () => dispose(callback);
};
