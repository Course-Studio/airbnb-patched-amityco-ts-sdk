import { ingestInCache } from '~/cache/api/ingestInCache';
import { getActiveClient } from '~/client/api/activeClient';
import { createEventSubscriber } from '~/core/events';

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

export const onChannelMemberRoleRemoved = (
  callback: (channel: Amity.StaticInternalChannel, member: Amity.Membership<'channel'>) => void,
): Amity.Unsubscriber => {
  if (callbacks.length === 0) {
    const client = getActiveClient();

    const filter = async (payload: Amity.ProcessedChannelPayload) => {
      const { channels, channelUsers } = payload;
      callback(channels[0], channelUsers.find(channelUser => channelUser.membership === 'member')!);
    };

    mainDisposer = createEventSubscriber(
      client,
      'onChannelMemberRoleRemoved',
      'local.channel-moderator.role-removed',
      filter,
    );
  }

  callbacks.push(callback);
  return () => dispose(callback);
};
