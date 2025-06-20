import { disableCache, enableCache } from '~/cache/api';

import {
  client,
  connectClient,
  disconnectClient,
  channel1,
  rawChannelUser,
  rawBannedChannelUser,
  user11,
  user13,
  channelRaw1,
  pause,
  channelModel1,
} from '~/utils/tests';

import { onChannelMemberBanned } from '../onChannelMemberBanned';

describe('onChannelMemberBanned event', () => {
  beforeAll(async () => {
    await connectClient();
  });

  afterAll(async () => {
    await disconnectClient();
  });

  beforeEach(enableCache);

  afterEach(disableCache);

  const channelPayload: Amity.ChannelMembershipPayload = {
    channelUsers: [rawChannelUser, rawBannedChannelUser],
    channels: [channelRaw1],
    files: [],
    users: [user11, user13],
    messagePreviews: [],
  };

  test('it should call callback with channel and banned member', async () => {
    const callback = jest.fn();

    const unsub = onChannelMemberBanned(callback);
    client.emitter.emit('channel.banned', channelPayload);

    await pause();

    unsub();

    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(channelModel1, { ...rawBannedChannelUser, user: user13 });
  });

  test('it should return an unsubscriber', () => {
    const callback = jest.fn();

    const unsub = onChannelMemberBanned(callback);
    unsub();

    client.emitter.emit('channel.unbanned', channelPayload);

    expect(callback).not.toHaveBeenCalled();
  });
});
