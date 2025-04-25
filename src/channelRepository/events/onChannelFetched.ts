import { createEventSubscriber } from '~/core/events';

import { getActiveClient } from '~/client/api/activeClient';

type CallbackFn = (channel: Amity.StaticInternalChannel[]) => void;
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

export const onChannelFetched = (callback: Amity.Listener<Amity.StaticInternalChannel[]>) => {
  if (callbacks.length === 0) {
    const client = getActiveClient();

    const filter = async (payload: Amity.StaticInternalChannel[]) => {
      callbacks.forEach(cb => cb(payload));
    };

    mainDisposer = createEventSubscriber(
      client,
      'onChannelFetched',
      'local.channel.fetched',
      filter,
    );
  }

  callbacks.push(callback);
  return () => dispose(callback);
};
