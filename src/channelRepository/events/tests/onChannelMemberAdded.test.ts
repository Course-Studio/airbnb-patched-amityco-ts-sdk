import { disableCache, enableCache } from '~/cache/api';
import {
  client,
  connectClient,
  disconnectClient,
  channel1,
  user11,
  rawChannelUser,
  channelRaw1,
  channelUser,
  pause,
  channelModel1,
} from '~/utils/tests';

import { onChannelMemberAdded } from '../onChannelMemberAdded';

describe('onChannelMemberAdded event', () => {
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

  test('it should call callback when have someone add member to channel', async () => {
    const callback = jest.fn();

    const unsub = onChannelMemberAdded(callback);
    client.emitter.emit('channel.membersAdded', channelPayload);

    await pause();

    unsub();

    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(channelModel1, channelUser);
  });

  test('it should return an unsubscriber', () => {
    const callback = jest.fn();

    const unsub = onChannelMemberAdded(callback);
    unsub();

    client.emitter.emit('channel.membersAdded', channelPayload);

    expect(callback).not.toHaveBeenCalled();
  });
});
