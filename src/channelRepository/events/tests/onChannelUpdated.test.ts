import { disableCache, enableCache } from '~/cache/api';
import {
  channelModel1,
  channelRaw1,
  client,
  connectClient,
  disconnectClient,
  pause,
  rawChannelUser,
  user11,
} from '~/utils/tests';

import { onChannelUpdated } from '../onChannelUpdated';

describe('onChannelUpdated event', () => {
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

  test('it should call callback when channel have updated', async () => {
    const callback = jest.fn();

    const unsub = onChannelUpdated(callback);
    client.emitter.emit('channel.updated', channelPayload);

    await pause();

    unsub();

    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(channelModel1);
  });

  test('it should return an unsubscriber', () => {
    const callback = jest.fn();

    const unsub = onChannelUpdated(callback);
    unsub();

    client.emitter.emit('channel.updated', channelPayload);

    expect(callback).not.toHaveBeenCalled();
  });
});
