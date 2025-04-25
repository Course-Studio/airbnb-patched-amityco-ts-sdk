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
  channelModel1,
  user11,
  channelUser,
  connectClient,
  disconnectClient,
} from '~/utils/tests';

import { onChannelMemberAdded } from '~/channelRepository/events';
import { addMembers } from '../addMembers';
import * as getChannelMarkers from '~/marker/api/getChannelMarkers';

describe('addMembers', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  const { channelId } = channelUserQueryResponse.data.channels[0];
  const { userId } = rawChannelUser;

  beforeAll(() => {
    jest.spyOn(getChannelMarkers, 'getChannelMarkers').mockImplementation(() =>
      Promise.resolve({
        data: [],
        cachedAt: undefined,
      }),
    );
  });

  // integration_test_id: e5bc67d9-7fbe-42ac-8fac-8ee25a6d6da2
  test('it should add channel members in channel', async () => {
    client.http.post = jest.fn().mockResolvedValueOnce(channelUserQueryResponse);

    const recieved = await addMembers(channelId, [userId]);

    expect(recieved).toBe(true);
  });

  // integration_test_id: 14286d06-b4c0-4b1d-80b8-c709dd7eac6c
  test('it should throw error with 400304 when adding a banned member', async () => {
    client.http.post = jest
      .fn()
      .mockRejectedValueOnce(
        new ASCApiError('banned', Amity.ServerError.CHANNEL_BAN, Amity.ErrorLevel.ERROR),
      );

    await expect(addMembers(channelId, [userId])).rejects.toThrow('400304');
  });

  test('it should update cache with channel members', async () => {
    enableCache();

    client.http.post = jest.fn().mockResolvedValueOnce(channelUserQueryResponse);

    const channelUserCacheKey = getResolver('channelUsers')({
      channelId,
      userId,
    });

    const recieved = await addMembers(channelId, [userId]);
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

  test('it should fire event when new members added', async () => {
    expect.assertions(1);

    client.http.post = jest.fn().mockResolvedValueOnce(channelUserQueryResponse);
    let dispose;

    const callback = new Promise(resolve => {
      dispose = onChannelMemberAdded(resolve);
    }).finally(dispose);

    await addMembers(channelId, [userId]);

    return expect(callback).resolves.not.toThrow();
  });

  test('it should fire event with all new members', async () => {
    client.http.post = jest.fn().mockResolvedValueOnce(channelUserQueryResponse);

    const callback = jest.fn();
    const { userId: userId2 } = rawChannelUser3;
    const unsub = onChannelMemberAdded(callback);

    const recieved = await addMembers(channelId, [userId, userId2]);

    expect(recieved).toBe(true);

    await pause();

    /*
     * Assertion below is required to check if the event handler is called with the right
     * params. It's not enough to check if the handler does not throw
     */
    expect(callback).toHaveBeenNthCalledWith(1, { ...channelModel1 }, { ...rawChannelUser });

    unsub();
  });

  test('it should fire event with all new members by attaching a user', async () => {
    enableCache();
    client.http.post = jest.fn().mockResolvedValueOnce(channelUserQueryResponse);

    const callback = jest.fn();
    const { userId: userId2 } = rawChannelUser3;
    const unsub = onChannelMemberAdded(callback);

    const recieved = await addMembers(channelId, [userId, userId2]);

    expect(recieved).toBe(true);

    await pause();

    /*
     * Assertion below is required to check if the event handler is called with the right
     * params. It's not enough to check if the handler does not throw
     */
    expect(callback).toHaveBeenNthCalledWith(
      1,
      { ...channelModel1 },
      { ...rawChannelUser, user: user11 },
    );

    unsub();
    disableCache();
  });

  test('it should return an error', async () => {
    client.http.post = jest.fn().mockRejectedValueOnce(new Error('error'));

    await expect(addMembers('channelId', [])).rejects.toThrow('error');
  });
});
