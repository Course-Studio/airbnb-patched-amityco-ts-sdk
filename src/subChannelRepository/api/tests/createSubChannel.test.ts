import { client, connectClient, disconnectClient, generateRawSubChannel } from '~/utils/tests';

import { onSubChannelCreated } from '~/subChannelRepository/events';

import { disableCache, enableCache, pullFromCache } from '~/cache/api';
import { ASCApiError } from '~/core/errors';

import { createSubChannel } from '../createSubChannel';

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

  // integration_test_id: fa72f0eb-b22b-4b9a-9e55-3a163a0ebd2a
  test('it should return a valid sub channel', async () => {
    const rawSubChannel = generateRawSubChannel();
    client.http.post = jest.fn().mockResolvedValue({
      data: { messageFeeds: [rawSubChannel], messages: [], users: [], files: [] },
    });

    const { data } = await createSubChannel(subChannelPayload);

    expect(data.channelId).toEqual(subChannelPayload.channelId);
    expect(data.displayName).toEqual(subChannelPayload.displayName);
    expect(data.subChannelId).toEqual(subChannelId);
  });

  // integration_test_id: f5b376b7-32b6-47f3-a5a1-553221340d17
  test('it should return error 400400 when try to create subChannel from wrong parent channel Id', async () => {
    const apiError = new ASCApiError(
      'Channel not found.',
      Amity.ServerError.ITEM_NOT_FOUND,
      Amity.ErrorLevel.ERROR,
    );

    client.http.post = jest.fn().mockRejectedValue({
      status: 404,
      data: apiError,
    });

    try {
      await createSubChannel({
        channelId: 'invalid_channel_id',
        displayName: 'sub channel name',
      });
    } catch ({ status = null, data = null }) {
      expect(status).toEqual(404);
      expect(data).toEqual(apiError);
    }
  });

  // integration_test_id: 73b59e57-2330-4ed3-95bd-241c9e7a2c43
  test('it should return error 400301 when try to create subChannel from channel Id which current user is not member', async () => {
    const apiError = new ASCApiError(
      'You are not a member of this channel.',
      Amity.ServerError.PERMISSION_DENIED,
      Amity.ErrorLevel.ERROR,
    );
    client.http.post = jest.fn().mockRejectedValue({
      status: 403,
      data: apiError,
    });

    try {
      await createSubChannel({
        channelId: 'invalid_channel_id',
        displayName: 'sub channel name',
      });
    } catch ({ status = null, data = null }) {
      expect(status).toEqual(403);
      expect(data).toEqual(apiError);
    }
  });

  test('it should return a valid sub channel from cache', async () => {
    const rawSubChannel = generateRawSubChannel();
    client.http.post = jest.fn().mockResolvedValue({
      data: { messageFeeds: [rawSubChannel], messages: [], users: [], files: [] },
    });

    const { data } = await createSubChannel(subChannelPayload);

    const cache = pullFromCache(['subChannel', 'get', subChannelId]);

    expect(cache?.data).toEqual(data);
  });

  test('should fire event `onSubChannelCreated`', async () => {
    let dispose;
    const rawSubChannel = generateRawSubChannel();
    client.http.post = jest.fn().mockResolvedValue({
      data: { messageFeeds: [rawSubChannel], messages: [], users: [], files: [] },
    });

    const callbackPromise = new Promise(resolve => {
      dispose = onSubChannelCreated(resolve);
    }).finally(dispose);

    const { data } = await createSubChannel(subChannelPayload);

    await expect(callbackPromise).resolves.toMatchObject(data);
  });
});
