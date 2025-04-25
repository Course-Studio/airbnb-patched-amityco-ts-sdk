import { disableCache, enableCache } from '~/cache/api';
import {
  channel1,
  channelModel1,
  channelRaw1,
  channelUser,
  client,
  connectClient,
  disconnectClient,
  pause,
  rawChannelUser,
  user11,
} from '~/utils/tests';

import { onChannelMemberRemoved } from '../onChannelMemberRemoved';

describe('onChannelMemberRemoved event', () => {
  beforeAll(async () => {
    await connectClient();
  });

  afterAll(async () => {
    await disconnectClient();
  });

  beforeEach(enableCache);

  afterEach(disableCache);

  const channelPayload: Amity.ChannelMembershipPayload = {
    channelUsers: [{ ...rawChannelUser, membership: 'none' }],
    channels: [channelRaw1],
    files: [],
    users: [user11],
    messagePreviews: [],
  };

  test('it should call callback when have someone remove member from channel', async () => {
    const callback = jest.fn();

    const unsub = onChannelMemberRemoved(callback);
    client.emitter.emit('channel.membersRemoved', channelPayload);

    await pause();

    unsub();

    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(channelModel1, { ...channelUser, membership: 'none' });
  });

  test('it should return an unsubscriber', () => {
    const callback = jest.fn();

    const unsub = onChannelMemberRemoved(callback);
    unsub();

    client.emitter.emit('channel.membersRemoved', channelPayload);

    expect(callback).not.toHaveBeenCalled();
  });
});
