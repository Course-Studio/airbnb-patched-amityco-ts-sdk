import { client, connectClient, disconnectClient, generateRawSubChannel } from '~/utils/tests';

import { disableCache, enableCache, pullFromCache } from '~/cache/api';
import { ASCApiError } from '~/core/errors';

import { getSubChannels } from '../getSubChannels';
import { onSubChannelFetched } from '../../events/onSubChannelFetched';

const subChannelId = 'channelId11--sub-channel-id';

const subChannelPayload = {
  channelId: 'channelId11',
  displayName: 'sub channel name',
};

describe('createSubChannel', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  beforeEach(enableCache);
  afterEach(disableCache);

  // integration_test_id: dc771f42-14b9-420e-999d-858151e8ce41
  test('it should return a valid sub channel', async () => {
    const rawSubChannel = generateRawSubChannel();
    client.http.get = jest.fn().mockResolvedValue({
      data: { messageFeeds: [rawSubChannel], messages: [], users: [], files: [] },
    });

    const { data } = await getSubChannels([subChannelId]);

    expect(data[0].channelId).toEqual(subChannelPayload.channelId);
    expect(data[0].displayName).toEqual(subChannelPayload.displayName);
    expect(data[0].subChannelId).toEqual(subChannelId);
  });

  // integration_test_id: 28710df0-e5b6-4e46-b1aa-440d5ea01995
  test('it should return error 400400 when try to get subChannel from invalid subChannelId', async () => {
    const apiError = new ASCApiError(
      'Feed not found',
      Amity.ServerError.ITEM_NOT_FOUND,
      Amity.ErrorLevel.ERROR,
    );

    client.http.get = jest.fn().mockRejectedValue({
      status: 404,
      data: apiError,
    });

    try {
      await getSubChannels([subChannelId]);
    } catch ({ status = null, data = null }) {
      expect(status).toEqual(404);
      expect(data).toEqual(apiError);
    }
  });

  test('it should return a valid sub channel from cache', async () => {
    const rawSubChannel = generateRawSubChannel();
    client.http.get = jest.fn().mockResolvedValue({
      data: { messageFeeds: [rawSubChannel], messages: [], users: [], files: [] },
    });

    const { data } = await getSubChannels([subChannelId]);

    const cache = pullFromCache(['subChannel', 'get', subChannelId]);

    expect(cache?.data).toEqual(data[0]);
  });

  test('it should return a valid sub channel from locally cache', async () => {
    const rawSubChannel = generateRawSubChannel();
    client.http.get = jest.fn().mockResolvedValue({
      data: { messageFeeds: [rawSubChannel], messages: [], users: [], files: [] },
    });

    await getSubChannels([subChannelId]);

    const cache = pullFromCache(['subChannel', 'get', subChannelId]);
    const locallyData = await getSubChannels.locally([subChannelId]);

    expect(cache?.data).toEqual(locallyData?.data[0]);
  });

  test('should fire event `onSubChannelFetched`', async () => {
    let dispose;
    const rawSubChannel = generateRawSubChannel();
    client.http.get = jest.fn().mockResolvedValue({
      data: { messageFeeds: [rawSubChannel], messages: [], users: [], files: [] },
    });

    const callbackPromise = new Promise(resolve => {
      dispose = onSubChannelFetched(resolve);
    }).finally(dispose);

    const { data } = await getSubChannels([subChannelId]);

    await expect(callbackPromise).resolves.toMatchObject(data[0]);
  });
});
