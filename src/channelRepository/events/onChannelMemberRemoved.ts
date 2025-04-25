import { getActiveClient } from '~/client/api/activeClient';
import { createEventSubscriber } from '~/core/events';

import { ingestInCache } from '~/cache/api/ingestInCache';

import { prepareChannelPayload } from '../utils';

type CallbackFn = (
  channel: Amity.StaticInternalChannel,
  member: Amity.Membership<'channel'>,
) => void;
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

export const onChannelMemberRemoved = (
  callback: (channel: Amity.StaticInternalChannel, member: Amity.Membership<'channel'>) => void,
) => {
  if (callbacks.length === 0) {
    const client = getActiveClient();

    const filter = async (payload: Amity.ChannelMembershipPayload) => {
      const preparedPayload = await prepareChannelPayload(payload);
      const { channels, channelUsers } = preparedPayload;

      ingestInCache(preparedPayload);
      callbacks.forEach(cb => cb(channels[0], channelUsers[0]));
    };

    mainDisposer = createEventSubscriber(
      client,
      'onChannelMemberRemoved',
      'channel.membersRemoved',
      filter,
    );
  }

  callbacks.push(callback);
  return () => dispose(callback);
};
