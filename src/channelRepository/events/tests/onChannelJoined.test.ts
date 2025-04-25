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

import { onChannelJoined } from '../onChannelJoined';

describe('onChannelJoined event', () => {
  beforeAll(async () => {
    await connectClient();
  });

  afterAll(async () => {
    await disconnectClient();
  });

  beforeEach(enableCache);

  afterEach(disableCache);

  const channelPayload: Amity.ChannelMembershipPayload = {
    channelUsers: [rawChannelUser],
    channels: [channelRaw1],
    files: [],
    users: [user11],
    messagePreviews: [],
  };

  test('it should call callback when have someone joined channel', async () => {
    const callback = jest.fn();

    const unsub = onChannelJoined(callback);
    client.emitter.emit('channel.joined', channelPayload);

    await pause();

    unsub();

    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(channelModel1, channelUser);
  });

  test('it should return an unsubscriber', () => {
    const callback = jest.fn();

    const unsub = onChannelJoined(callback);
    unsub();

    client.emitter.emit('channel.joined', channelPayload);

    expect(callback).not.toHaveBeenCalled();
  });
});
