import { client, connectClient, disconnectClient, generateRawSubChannel } from '~/utils/tests';

import { disableCache, enableCache, pullFromCache } from '~/cache/api';
import { ASCApiError } from '~/core/errors';

import { deleteSubChannel } from '../deleteSubChannel';
import { onSubChannelDeleted } from '../../events';

const subChannelId = 'channelId11--sub-channel-id';

describe('deleteSubChannel', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  beforeEach(enableCache);
  afterEach(disableCache);

  // integration_test_id: 43ba1273-4560-4cea-93ce-cf5728b2a475
  test('it should delete sub channel', async () => {
    const rawSubChannel = generateRawSubChannel();
    const rawDeleteSubChannel = generateRawSubChannel({ isDeleted: true });

    // Mock for getSubChannel
    client.http.get = jest.fn().mockResolvedValue({
      data: { messageFeeds: [rawSubChannel], messages: [], users: [], files: [] },
    });

    client.http.delete = jest.fn().mockResolvedValue({
      data: {
        messageFeeds: [rawDeleteSubChannel],
        messages: [],
        users: [],
        files: [],
      },
    });

    const result = await deleteSubChannel(subChannelId);
    expect(result.isDeleted).toEqual(true);
  });

  // integration_test_id: 57ba785f-484b-4f19-aa38-18e0bd4ec433
  test('it should return error 400400 when try to delete subChannel from invalid subChannelId', async () => {
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
      await deleteSubChannel(subChannelId);
    } catch ({ status = null, data = null }) {
      expect(status).toEqual(404);
      expect(data).toEqual(apiError);
    }
  });

  test('it should return a valid sub channel from cache', async () => {
    const rawSubChannel = generateRawSubChannel();
    const rawDeleteSubChannel = generateRawSubChannel({ isDeleted: true });

    // Mock for getSubChannel
    client.http.get = jest.fn().mockResolvedValue({
      data: { messageFeeds: [rawSubChannel], messages: [], users: [], files: [] },
    });

    client.http.delete = jest.fn().mockResolvedValue({
      data: {
        messageFeeds: [rawDeleteSubChannel],
        messages: [],
        users: [],
        files: [],
      },
    });

    await deleteSubChannel(subChannelId);

    const cache = pullFromCache(['subChannel', 'get', subChannelId]);

    expect(cache?.data).toEqual(expect.objectContaining({ isDeleted: true }));
  });

  test('should fire event `onChannelDeleted`', async () => {
    let dispose;
    const rawSubChannel = generateRawSubChannel();
    const rawDeleteSubChannel = generateRawSubChannel({ isDeleted: true });

    // Mock for getSubChannel
    client.http.get = jest.fn().mockResolvedValue({
      data: { messageFeeds: [rawSubChannel], messages: [], users: [], files: [] },
    });

    client.http.delete = jest.fn().mockResolvedValue({
      data: {
        messageFeeds: [rawDeleteSubChannel],
        messages: [],
        users: [],
        files: [],
      },
    });

    const callbackPromise = new Promise(resolve => {
      dispose = onSubChannelDeleted(resolve);
    }).finally(dispose);

    await deleteSubChannel(subChannelId);

    await expect(callbackPromise).resolves.toEqual(expect.objectContaining({ isDeleted: true }));
  });
});
