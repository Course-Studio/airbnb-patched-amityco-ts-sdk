import { ASCApiError } from '~/core/errors';
import { disableCache, enableCache, pushToCache } from '~/cache/api';
import {
  client,
  channelQueryResponse,
  convertRawChannelPayload,
  connectClient,
  disconnectClient,
} from '~/utils/tests';

import { pushToTombstone } from '~/cache/api/pushToTombstone';
import { isInTombstone } from '~/cache/api/isInTombstone';

import { getChannel } from '../getChannel';

const { channelId } = channelQueryResponse.data.channels[0];
const channel = convertRawChannelPayload(channelQueryResponse.data).channels[0];

describe('getChannel', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  // integration_test_id: b331e01c-20db-4f17-979b-b280d8818792
  test('it should return a valid channel', async () => {
    client.http.get = jest.fn().mockResolvedValueOnce(channelQueryResponse);

    const expected = channel;
    const { data: received } = await getChannel(channelId);

    expect(received).toStrictEqual(expected);
  });

  test('it should update cache after fetch from server', async () => {
    enableCache();
    client.http.get = jest.fn().mockResolvedValue(channelQueryResponse);
    await getChannel(channelId);

    expect(getChannel.locally(channelId)).toBeDefined();

    disableCache();
  });

  // integration_test_id: da9dc3e8-01fd-4e76-a26b-ac8333a69b23
  test('it should return an error', async () => {
    client.http.get = jest.fn().mockRejectedValueOnce(new Error('error'));

    await expect(getChannel(channelId)).rejects.toThrow('error');
  });

  test('it should return an error if channel in cache but api throws not found', async () => {
    enableCache();
    pushToCache(['channel', 'get', channelId], channel, { cachedAt: Date.now() });

    client.http.get = jest
      .fn()
      .mockRejectedValueOnce(
        new ASCApiError('not found!', Amity.ServerError.ITEM_NOT_FOUND, Amity.ErrorLevel.ERROR),
      );

    await expect(getChannel(channelId)).rejects.toThrow();
    expect(getChannel.locally(channelId)).toBeUndefined();

    disableCache();
  });
});

describe('getChannel locally', () => {
  test('it should return data from cache', () => {
    enableCache();

    const cachedAt = Date.now();

    pushToCache(['channel', 'get', channelId], channel, { cachedAt });

    const data = getChannel.locally(channelId);

    expect(data).toBeDefined();
    expect(data?.data).toEqual(channel);
    expect(data?.cachedAt).toEqual(cachedAt);

    disableCache();
  });

  test('should return undefined if channel not in cache', () => {
    expect(getChannel.locally('non-existent-channel')).toBeUndefined();
  });

  test('should return undefined if cache not enabled', () => {
    expect(getChannel.locally(channelId)).toBeUndefined();
  });
});

describe('getChannel tombostone', () => {
  test('it should add channel to tombostone if 404', async () => {
    enableCache();

    client.http.get = jest
      .fn()
      .mockRejectedValueOnce(
        new ASCApiError('not found!', Amity.ServerError.ITEM_NOT_FOUND, Amity.ErrorLevel.ERROR),
      );

    await expect(getChannel(channelId)).rejects.toThrow();
    expect(() => {
      isInTombstone('channel', channelId);
    }).toThrow();

    disableCache();
  });

  test('it should throw error if channel not found in tombostone', async () => {
    enableCache();

    pushToTombstone('channel', channelId);
    await expect(getChannel(channelId)).rejects.toThrow();

    disableCache();
  });
});
