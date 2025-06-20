import { client, connectClient, disconnectClient, generateRawSubChannel } from '~/utils/tests';
import { disableCache, enableCache, pullFromCache } from '~/cache/api';
import { ASCApiError } from '~/core/errors';

import { getSubChannel } from '../getSubChannel';
import { onSubChannelFetched } from '../../events/onSubChannelFetched';

const subChannelId = 'channelId11--sub-channel-id';

const subChannelPayload = {
  channelId: 'channelId11',
  displayName: 'sub channel name',
};

describe('getSubChannel', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  beforeEach(enableCache);
  afterEach(disableCache);

  // integration_test_id: 6f019056-921e-43e2-a426-dd5a96f2fdcf
  test('it should return a valid sub channel', async () => {
    const rawSubChannel = generateRawSubChannel();
    client.http.get = jest.fn().mockResolvedValue({
      data: { messageFeeds: [rawSubChannel], messages: [], users: [], files: [] },
    });

    const { data } = await getSubChannel(subChannelId);

    expect(data.channelId).toEqual(subChannelPayload.channelId);
    expect(data.displayName).toEqual(subChannelPayload.displayName);
    expect(data.subChannelId).toEqual(subChannelId);
  });

  // integration_test_id: 0dc440b6-b2bb-41fb-bbe8-1b2a4c71bffc
  test('it should return error 400400 when try to get subChannel from invalid subChannelId', async () => {
    const apiError = new ASCApiError(
      'Feed not found',
      Amity.ServerError.ITEM_NOT_FOUND,
      Amity.ErrorLevel.ERROR,
    );

    client.http.put = jest.fn().mockRejectedValue({
      status: 404,
      data: apiError,
    });

    try {
      await getSubChannel(subChannelId);
    } catch ({ status = null, data = null }) {
      expect(status).toEqual(404);
      expect(data).toEqual(apiError);
    }
  });

  test('it should return a valid sub channel from cache', async () => {
    const rawSubChannel = generateRawSubChannel();
    client.http.put = jest.fn().mockResolvedValue({
      data: { messageFeeds: [rawSubChannel], messages: [], users: [], files: [] },
    });

    const { data } = await getSubChannel(subChannelId);

    const cache = pullFromCache(['subChannel', 'get', subChannelId]);

    expect(cache?.data).toEqual(data);
  });

  test('it should return a valid sub channel from locally cache', async () => {
    const rawSubChannel = generateRawSubChannel();
    client.http.put = jest.fn().mockResolvedValue({
      data: { messageFeeds: [rawSubChannel], messages: [], users: [], files: [] },
    });

    await getSubChannel(subChannelId);

    const cache = pullFromCache(['subChannel', 'get', subChannelId]);
    const locallyData = await getSubChannel.locally(subChannelId);

    expect(cache?.data).toEqual(locallyData?.data);
  });

  test('should fire event `onSubChannelFetched`', async () => {
    let dispose;
    const rawSubChannel = generateRawSubChannel();
    client.http.put = jest.fn().mockResolvedValue({
      data: { messageFeeds: [rawSubChannel], messages: [], users: [], files: [] },
    });

    const callbackPromise = new Promise(resolve => {
      dispose = onSubChannelFetched(resolve);
    }).finally(dispose);

    const { data } = await getSubChannel(subChannelId);

    await expect(callbackPromise).resolves.toMatchObject(data);
  });
});
