import { disableCache, enableCache, pushToCache } from '~/cache/api';
import {
  client,
  connectClient,
  convertRawChannelPayload,
  disconnectClient,
  getChannelsResponse,
} from '~/utils/tests';
import { ASCApiError } from '~/core/errors';

import { getChannelByIds } from '../getChannelByIds';

const channelIds = [
  getChannelsResponse.data.channels[0].channelId,
  getChannelsResponse.data.channels[1].channelId,
  getChannelsResponse.data.channels[2].channelId,
];
const { channels } = convertRawChannelPayload(getChannelsResponse.data);

describe('getChannelByIds', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  // integration_test_id: ced0cd3b-1714-499d-862e-0284da1c8bb1
  test('it should return a valid channels', async () => {
    client.http.get = jest.fn().mockResolvedValueOnce(getChannelsResponse);

    const expected = channels;
    const { data: received } = await getChannelByIds(channelIds);

    expect(received).toStrictEqual(expected);
  });

  test('it should update cache after fetch from server', async () => {
    enableCache();
    client.http.get = jest.fn().mockResolvedValue(getChannelsResponse);
    await getChannelByIds(channelIds);

    const data = getChannelByIds.locally(channelIds);

    expect(data).toBeDefined();
    expect(data?.data).toEqual(channels);

    disableCache();
  });

  // integration_test_id: 344a8f3d-0e54-4eb9-850f-80283e638352
  test('it should return an error 400400 when try to get channels by invalid channel id', async () => {
    const error = new ASCApiError(
      'Some channel not found',
      Amity.ServerError.ITEM_NOT_FOUND,
      Amity.ErrorLevel.ERROR,
    );

    client.http.get = jest.fn().mockRejectedValueOnce(error);

    await expect(getChannelByIds(channelIds)).rejects.toThrow(error);
  });
});

describe('getChannelByIds locally', () => {
  test('it should return data from cache', () => {
    enableCache();

    const cachedAt = Date.now();

    pushToCache(['channel', 'get', channelIds[0]], channels[0], { cachedAt });
    pushToCache(['channel', 'get', channelIds[1]], channels[1], { cachedAt });
    pushToCache(['channel', 'get', channelIds[2]], channels[2], { cachedAt });

    const data = getChannelByIds.locally(channelIds);

    expect(data).toBeDefined();
    expect(data?.data).toEqual(channels);
    expect(data?.cachedAt).toEqual(cachedAt);

    disableCache();
  });

  test('should return undefined if channel not in cache', () => {
    expect(
      getChannelByIds.locally(['non-existent-channel-1', 'non-existent-channel-2']),
    ).toBeUndefined();
  });

  test('should return undefined if cache not enabled', () => {
    expect(getChannelByIds.locally(channelIds)).toBeUndefined();
  });

  test('it should return cachedAt same date with oldest record', () => {
    enableCache();

    const cachedAt = Date.now();

    pushToCache(['channel', 'get', channelIds[0]], channels[0], { cachedAt });
    pushToCache(['channel', 'get', channelIds[1]], channels[1], { cachedAt: cachedAt + 1 });
    pushToCache(['channel', 'get', channelIds[2]], channels[2], { cachedAt: cachedAt + 2 });

    const data = getChannelByIds.locally(channelIds);

    expect(data?.cachedAt).toEqual(cachedAt);

    disableCache();
  });
});
