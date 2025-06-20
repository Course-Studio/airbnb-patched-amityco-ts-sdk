import { client, connectClient, disconnectClient, generateRawSubChannel } from '~/utils/tests';

import { onSubChannelUpdated } from '~/subChannelRepository/events';

import { disableCache, enableCache, pullFromCache } from '~/cache/api';
import { ASCApiError } from '~/core/errors';

import { updateSubChannel } from '../updateSubChannel';

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

  // integration_test_id: 9f50fa02-c26c-4666-8e8b-2d9076a3edd3
  test('it should return a valid sub channel', async () => {
    const rawSubChannel = generateRawSubChannel();
    client.http.put = jest.fn().mockResolvedValue({
      data: { messageFeeds: [rawSubChannel], messages: [], users: [], files: [] },
    });

    const { data } = await updateSubChannel(subChannelId, subChannelPayload);

    expect(data.channelId).toEqual(subChannelPayload.channelId);
    expect(data.displayName).toEqual(subChannelPayload.displayName);
    expect(data.subChannelId).toEqual(subChannelId);
  });

  // integration_test_id: 118f410c-5476-4c4e-9199-ac166da30840
  test('it should return error 400400 when try to update subChannel from wrong sub channel Id', async () => {
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
      await updateSubChannel(subChannelId, {
        displayName: 'sub channel name',
      });
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

    const { data } = await updateSubChannel(subChannelId, subChannelPayload);

    const cache = pullFromCache(['subChannel', 'get', subChannelId]);

    expect(cache?.data).toEqual(data);
  });

  test('should fire event `onSubChannelUpdated`', async () => {
    let dispose;
    const rawSubChannel = generateRawSubChannel();
    client.http.put = jest.fn().mockResolvedValue({
      data: { messageFeeds: [rawSubChannel], messages: [], users: [], files: [] },
    });

    const callbackPromise = new Promise(resolve => {
      dispose = onSubChannelUpdated(resolve);
    }).finally(dispose);

    const { data } = await updateSubChannel(subChannelId, subChannelPayload);

    await expect(callbackPromise).resolves.toMatchObject(data);
  });
});
