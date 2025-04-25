import { disableCache, enableCache } from '~/cache/api';

import {
  client,
  connectClient,
  disconnectClient,
  channel1,
  rawChannelUser,
  rawChannelUser3,
  user11,
  user12,
  channelRaw1,
  pause,
  channelModel1,
} from '~/utils/tests';

import { onChannelMemberUnbanned } from '../onChannelMemberUnbanned';

describe('onChannelMemberBanned event', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  beforeEach(enableCache);
  afterEach(disableCache);

  const channelPayload: Amity.ChannelMembershipPayload = {
    channelUsers: [rawChannelUser, rawChannelUser3],
    channels: [channelRaw1],
    files: [],
    users: [user11, user12],
    messagePreviews: [],
  };

  test('it should call callback with channel and unbanned member', async () => {
    const callback = jest.fn();

    const unsub = onChannelMemberUnbanned(callback);
    client.emitter.emit('channel.unbanned', channelPayload);

    await pause();

    unsub();

    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(channelModel1, { ...rawChannelUser3, user: user12 });
  });

  test('it should return an Unsubscriber', async () => {
    const callback = jest.fn();

    const unsub = onChannelMemberUnbanned(callback);

    await pause();

    unsub();

    client.emitter.emit('channel.unbanned', channelPayload);

    expect(callback).not.toHaveBeenCalled();
  });
});
