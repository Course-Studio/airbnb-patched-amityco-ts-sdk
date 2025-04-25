import { disableCache, enableCache } from '~/cache/api';
import {
  pause,
  client,
  connectClient,
  disconnectClient,
  generateRawSubChannel,
  convertSubChannelFromRaw,
} from '~/utils/tests';
import { createQuery, runQuery } from '~/core/query';
import { deleteSubChannel, updateSubChannel } from '~/subChannelRepository/api';
import { getSubChannel as _getSubChannel } from '~/subChannelRepository/api/getSubChannel';
import { getFutureDate } from '~/core/model';
import { getSubChannel } from '../getSubChannel';
import * as getSubChannelMarkers from '../../../marker/api/getSubChannelMarkers';

describe('getSubChannel', () => {
  const rawSubChannel = generateRawSubChannel();
  const subChannel = convertSubChannelFromRaw(rawSubChannel);
  const response = { data: { messageFeeds: [rawSubChannel], messages: [], users: [], files: [] } };

  beforeAll(async () => {
    await connectClient();

    jest
      .spyOn(getSubChannelMarkers, 'getSubChannelMarkers')
      .mockResolvedValue({ data: [], cachedAt: undefined });
  });

  afterAll(disconnectClient);
  beforeEach(enableCache);
  afterEach(disableCache);

  const events: [string, keyof Amity.Events][] = [
    ['should get update on message-feed.updated event', 'message-feed.updated'],
    ['should get update on message-feed.deleted event', 'message-feed.deleted'],
  ];

  test.each(events)('%s', async (test, event) => {
    const update = {
      ...rawSubChannel,
      name: event,
      updatedAt: getFutureDate(rawSubChannel.updatedAt),
    };
    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(response);

    getSubChannel(subChannel.subChannelId, callback);
    await pause();
    client.emitter.emit(event, { messageFeeds: [update], messages: [], users: [], files: [] });
    await pause();

    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        data: { ...convertSubChannelFromRaw(update), messagePreview: null },
        loading: false,
      }),
    );
  });

  describe('should get an update without rte subscription', () => {
    const update = {
      ...rawSubChannel,
      name: 'new name',
      updatedAt: getFutureDate(rawSubChannel.updatedAt),
    };

    test('if _getSubChannel is called', async () => {
      const callback = jest.fn();
      client.http.get = jest
        .fn()
        .mockResolvedValueOnce(response)
        .mockResolvedValueOnce({
          data: { messageFeeds: [update], messages: [], users: [], files: [] },
        });

      getSubChannel(subChannel.subChannelId, callback);
      await pause();
      await _getSubChannel(subChannel.subChannelId);
      await pause();

      expect(callback).toHaveBeenCalledTimes(3);
      expect(callback).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({
          data: { ...convertSubChannelFromRaw(update), messagePreview: null },
          loading: false,
        }),
      );
    });

    test('if updateSubChannel is called', async () => {
      const callback = jest.fn();
      client.http.get = jest.fn().mockResolvedValue(response);
      client.http.put = jest.fn().mockResolvedValue({
        data: { messageFeeds: [update], messages: [], users: [], files: [] },
      });

      getSubChannel(subChannel.subChannelId, callback);
      await pause();
      await updateSubChannel(subChannel.subChannelId, { displayName: update.name });
      await pause();

      expect(callback).toHaveBeenCalledTimes(3);
      expect(callback).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({
          data: { ...convertSubChannelFromRaw(update), messagePreview: null },
          loading: false,
        }),
      );
    });

    test('if deleteSubChannel is called', async () => {
      const callback = jest.fn();
      client.http.get = jest.fn().mockResolvedValue(response);
      client.http.delete = jest.fn().mockResolvedValue({ data: { success: true } });

      getSubChannel(subChannel.subChannelId, callback);
      await pause();
      runQuery(createQuery(deleteSubChannel, subChannel.subChannelId));
      await pause();

      expect(callback).toHaveBeenCalledTimes(3);
      expect(callback).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({
          data: {
            ...subChannel,
            isDeleted: true,
            updatedAt: expect.anything(),
            messagePreview: null,
          },
          loading: false,
        }),
      );
    });
  });
});
