import { ASCApiError } from '~/core/errors';
import { getResolver } from '~/core/model';
import { pullFromCache, enableCache, disableCache } from '~/cache/api';

import {
  client,
  pause,
  channelUserQueryResponse,
  rawChannelUser,
  rawChannelUser3,
  channel1,
  channelUser,
  channelUser3,
  connectClient,
  disconnectClient,
} from '~/utils/tests';

import { onChannelMemberRemoved } from '~/channelRepository/events';

import { removeMembers } from '../removeMembers';

describe('removeMembers', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  beforeEach(enableCache);
  afterEach(disableCache);

  const { channelId } = channelUserQueryResponse.data.channels[0];
  const { userId } = rawChannelUser;

  // integration_test_id: fa47f7d9-2b60-4f4e-b65f-f3c3a7999a3f
  test('it should remove channel members from channel', async () => {
    client.http.delete = jest.fn().mockResolvedValueOnce(channelUserQueryResponse);

    const recieved = await removeMembers(channelId, [userId]);

    expect(recieved).toBe(true);
  });

  test('it should update cache with removed channel members', async () => {
    enableCache();

    client.http.delete = jest.fn().mockResolvedValueOnce(channelUserQueryResponse);

    const channelUserCacheKey = getResolver('channelUsers')({
      channelId,
      userId,
    });

    const recieved = await removeMembers(channelId, [userId]);
    const recievedCache = pullFromCache<Amity.Membership<'channel'>>([
      'channelUsers',
      'get',
      channelUserCacheKey,
    ])?.data;

    expect(recieved).toBe(true);
    expect(recievedCache).toBeDefined();
    expect(recievedCache).toEqual(channelUser);

    disableCache();
  });

  test('it should fire event when members are removed', async () => {
    expect.assertions(1);

    client.http.delete = jest.fn().mockResolvedValueOnce(channelUserQueryResponse);
    let dispose;

    const callback = new Promise(resolve => {
      dispose = onChannelMemberRemoved(resolve);
    }).finally(dispose);

    await removeMembers(channelId, [userId]);

    return expect(callback).resolves.not.toThrow();
  });

  test('it should fire event with all removed members', async () => {
    client.http.delete = jest.fn().mockResolvedValueOnce(channelUserQueryResponse);

    const callback = jest.fn();
    const { userId: userId2 } = rawChannelUser3;
    const unsub = onChannelMemberRemoved(callback);

    const recieved = await removeMembers(channelId, [userId, userId2]);

    expect(recieved).toBe(true);

    await pause();

    /*
     * Removed assertion for checking what the callback was called with as it's
     * impossible to guarantee the order in which the events will be fired
     */
    expect(callback).toHaveBeenCalledTimes(2);

    unsub();
  });

  // integration_test_id: a9d13eff-5e17-4fc5-b20e-43c568aa8c23
  test('it should return an error', async () => {
    client.http.delete = jest
      .fn()
      .mockRejectedValueOnce(
        new ASCApiError('banned', Amity.ServerError.CHANNEL_BAN, Amity.ErrorLevel.ERROR),
      );

    await expect(removeMembers('channelId', [])).rejects.toThrow('400304');
  });
});
