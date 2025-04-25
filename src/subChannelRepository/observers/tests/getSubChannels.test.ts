import { disableCache, enableCache, pushToCache } from '~/cache/api';
import {
  client,
  connectClient,
  disconnectClient,
  pause,
  generateRawSubChannel,
  convertSubChannelFromRaw,
} from '~/utils/tests';
import { getFutureDate, getPastDate } from '~/core/model';
import * as getSubChannelMarkers from '~/marker/api/getSubChannelMarkers';
import { getSubChannels } from '../getSubChannels';
import { ASCApiError } from '~/core/errors';
import { getSubChannelMessagePreviewWithUser } from '~/messagePreview/utils';

describe('getSubChannels', () => {
  const rawSubChannel = generateRawSubChannel();
  const response = {
    data: {
      messageFeeds: [rawSubChannel],
      messages: [],
      users: [],
      files: [],
      paging: {},
    },
  };

  beforeAll(async () => {
    await connectClient();

    jest
      .spyOn(getSubChannelMarkers, 'getSubChannelMarkers')
      .mockResolvedValue({ data: [], cachedAt: undefined });
  });

  afterAll(disconnectClient);
  beforeEach(enableCache);
  afterEach(disableCache);

  test('should get sub channels', async () => {
    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(response);

    getSubChannels({ channelId: rawSubChannel.channelPublicId }, callback);
    await pause();

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        data: [],
        loading: true,
      }),
    );
    expect(callback).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        data: [convertSubChannelFromRaw(rawSubChannel)].map(subChannel => {
          return { ...subChannel, messagePreview: null };
        }),
        loading: false,
      }),
    );
  });

  test('should error when get invalid sub channels', async () => {
    const rawSubChannels = [
      generateRawSubChannel({ isDeleted: true }),
      generateRawSubChannel({ messageFeedId: 'sub-channel-id-2' }),
    ];
    const callback = jest.fn();

    const error = new ASCApiError(
      'Channel not found.',
      Amity.ServerError.ITEM_NOT_FOUND,
      Amity.ErrorLevel.ERROR,
    );

    client.http.get = jest.fn().mockRejectedValue(error);

    getSubChannels({ channelId: rawSubChannel.channelPublicId }, callback);
    await pause();

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        data: [],
        loading: true,
      }),
    );
    expect(callback).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        data: [],
        loading: false,
        error,
      }),
    );
  });

  test('should fetch next page', async () => {
    const rawSubChannel2 = generateRawSubChannel({
      messageFeedId: 'sub-channel-id-2',
      lastMessageTimestamp: getPastDate(rawSubChannel.lastMessageTimestamp),
    });
    const callback = jest.fn();
    client.http.get = jest
      .fn()
      .mockResolvedValueOnce({
        data: {
          messageFeeds: [rawSubChannel],
          messages: [],
          users: [],
          files: [],
          paging: {
            previous: 'eyJiZWZvcmUiOjU1LCJsYXN0IjoxMH0=',
            next: 'eyJiZWZvcmUiOjU1LCJsYXN0IjoxMH0=',
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          messageFeeds: [rawSubChannel2],
          messages: [],
          users: [],
          files: [],
          paging: {
            previous: 'eyJiZWZvcmUiOjU1LCJsYXN0IjoxMH0=',
            next: 'eyJiZWZvcmUiOjU1LCJsYXN0IjoxMH0=',
          },
        },
      });

    getSubChannels({ channelId: rawSubChannel.channelPublicId }, callback);
    await pause();
    callback.mock.lastCall[0].onNextPage();
    await pause();

    expect(callback).toHaveBeenCalledTimes(4);
    expect(callback).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        hasNextPage: true,
        onNextPage: expect.anything(),
      }),
    );
    expect(callback).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({
        data: [rawSubChannel, rawSubChannel2]
          .map(data => convertSubChannelFromRaw(data))
          .map(subChannel => {
            return { ...subChannel, messagePreview: null };
          }),
        loading: false,
      }),
    );
  });

  test('when querying two subchannel collections with same channelId but different params, pagination remains functional', async () => {
    const subChannelCase1Page1 = [
      generateRawSubChannel({ channelPublicId: 'channel1', name: '1', messageFeedId: '1' }),
      generateRawSubChannel({ channelPublicId: 'channel1', name: '2', messageFeedId: '2' }),
    ];
    const subChannelCase1Page2 = [
      generateRawSubChannel({ channelPublicId: 'channel1', name: '3', messageFeedId: '3' }),
      generateRawSubChannel({ channelPublicId: 'channel1', name: '4', messageFeedId: '4' }),
    ];
    const subChannelCase2Page1 = [
      generateRawSubChannel({ channelPublicId: 'channel1', name: 'x6', messageFeedId: 'x6' }),
      generateRawSubChannel({ channelPublicId: 'channel1', name: 'x5', messageFeedId: 'x5' }),
    ];
    const subChannelCase2Page2 = [
      generateRawSubChannel({ channelPublicId: 'channel1', name: 'x4', messageFeedId: 'x4' }),
      generateRawSubChannel({ channelPublicId: 'channel1', name: 'x3', messageFeedId: 'x3' }),
    ];
    const subChannelCase2Page3 = [
      generateRawSubChannel({ channelPublicId: 'channel1', name: 'x2', messageFeedId: 'x2' }),
      generateRawSubChannel({ channelPublicId: 'channel1', name: 'x1', messageFeedId: 'x1' }),
    ];

    const callback = jest.fn();
    const callback2 = jest.fn();

    client.http.get = jest.fn().mockImplementation((url, params) => {
      if (params.params?.excludeDefaultMessageFeed === true) {
        if (params?.params?.options?.token === 'eyJiZWZvcmUiOjU1LCJsYXN0IjoxMH0=') {
          return Promise.resolve({
            data: {
              messageFeeds: subChannelCase2Page2,
              messages: [],
              users: [],
              files: [],
              paging: {
                previous: 'eyJiZWZvcmUiOjQ1LCJsYXN0IjoxMH0=',
                next: 'eyJiZWZvcmUiOjQ1LCJsaW1pdCI6NX0=',
              },
            },
          });
        }

        if (params?.params?.options?.token === 'eyJiZWZvcmUiOjQ1LCJsaW1pdCI6NX0=') {
          return Promise.resolve({
            data: {
              messageFeeds: subChannelCase2Page3,
              messages: [],
              users: [],
              files: [],
              paging: {
                next: 'eyJiZWZvcmUiOjQ1LCJsYXN0IjoxMH0=',
              },
            },
          });
        }

        return Promise.resolve({
          data: {
            messageFeeds: subChannelCase2Page1,
            messages: [],
            users: [],
            files: [],
            paging: {
              previous: 'eyJiZWZvcmUiOjU1LCJsYXN0IjoxMH0=',
              next: 'eyJiZWZvcmUiOjU1LCJsYXN0IjoxMH0=',
            },
          },
        });
      }
      if (params?.params?.options?.token === 'eyJiZWZvcmUiOjU1LCJsYXN0IjoxMH0=') {
        return Promise.resolve({
          data: {
            messageFeeds: subChannelCase1Page2,
            messages: [],
            users: [],
            files: [],
            paging: {
              previous: 'eyJiZWZvcmUiOjQ1LCJsYXN0IjoxMH0=',
              next: 'eyJiZWZvcmUiOjQ1LCJsYXN0IjoxMH0=',
            },
          },
        });
      }

      return Promise.resolve({
        data: {
          messageFeeds: subChannelCase1Page1,
          messages: [],
          users: [],
          files: [],
          paging: {
            previous: 'eyJiZWZvcmUiOjU1LCJsYXN0IjoxMH0=',
            next: 'eyJiZWZvcmUiOjU1LCJsYXN0IjoxMH0=',
          },
        },
      });
    });

    getSubChannels({ channelId: 'channel1' }, callback);
    getSubChannels({ channelId: 'channel1', excludeDefaultSubChannel: true }, callback2);

    await pause();

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).lastCalledWith(
      expect.objectContaining({
        data: subChannelCase1Page1
          .map(convertSubChannelFromRaw)
          .map(getSubChannelMessagePreviewWithUser),
        loading: false,
        hasNextPage: true,
        error: undefined,
      }),
    );

    expect(callback2).toHaveBeenCalledTimes(2);

    /**
     * not have been called with subChannelCase1Page1
     */
    expect(callback2).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: subChannelCase1Page1
          .map(convertSubChannelFromRaw)
          .map(getSubChannelMessagePreviewWithUser),
        loading: false,
      }),
    );

    expect(callback2).lastCalledWith(
      expect.objectContaining({
        data: subChannelCase2Page1
          .map(convertSubChannelFromRaw)
          .map(getSubChannelMessagePreviewWithUser),
        loading: false,
        hasNextPage: true,
        error: undefined,
      }),
    );

    callback2.mock.lastCall[0].onNextPage();

    await pause();

    callback2.mock.lastCall[0].onNextPage();

    await pause();

    /**
     * calling callback 2 times so, callback2 should have been called 6 times with 3 pages of data
     */
    expect(callback2).toHaveBeenCalledTimes(6);
    expect(callback2).lastCalledWith(
      expect.objectContaining({
        data: [...subChannelCase2Page1, ...subChannelCase2Page2, ...subChannelCase2Page3]
          .map(convertSubChannelFromRaw)
          .map(getSubChannelMessagePreviewWithUser),
        loading: false,
      }),
    );

    callback.mock.lastCall[0].onNextPage();

    await pause();

    // /**
    //  * calling nextPage 1 times so, callback2 should have been called 4 times;
    //  */
    expect(callback).toHaveBeenCalledTimes(4);
    expect(callback).lastCalledWith(
      expect.objectContaining({
        data: [...subChannelCase1Page1, ...subChannelCase1Page2]
          .map(convertSubChannelFromRaw)
          .map(getSubChannelMessagePreviewWithUser),
        loading: false,
      }),
    );

    expect(callback).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: [...subChannelCase2Page1, ...subChannelCase2Page2, ...subChannelCase2Page3]
          .map(convertSubChannelFromRaw)
          .map(getSubChannelMessagePreviewWithUser),
        loading: false,
      }),
    );
  });

  /**
   * TODO: change this test to use with event
   * and add test to check if query params is converted correct for includeDeleted
   */
  describe('when querying the subchannel collection with specific sort and filter options, results sort correctly', () => {
    const subChannel1 = generateRawSubChannel({ channelId: 'aaaaa', messageFeedId: 'aaaa-1' });
    const deletedRawSubChannel = generateRawSubChannel({
      channelId: 'aaaaa',
      messageFeedId: 'aaaa-2',
      isDeleted: true,
    });

    const filterCases: [
      string,
      Amity.SubChannelLiveCollection,
      Amity.RawSubChannel[],
      Amity.RawSubChannel[],
    ][] = [
      [
        'includeDeleted = true',
        { channelId: 'aaaaa', includeDeleted: true },
        [deletedRawSubChannel, subChannel1],
        [deletedRawSubChannel, subChannel1],
      ],
      [
        'includeDeleted = false',
        { channelId: 'aaaaa', includeDeleted: false },
        [subChannel1],
        [subChannel1],
      ],
    ];

    test.each(filterCases)('%s', async (_test, params, responses, expected) => {
      const callback = jest.fn();
      client.http.get = jest.fn().mockResolvedValue({
        data: {
          messageFeeds: responses,
          messages: [],
          users: [],
          files: [],
          paging: {},
        },
      });

      getSubChannels(params, callback);

      await pause();

      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).lastCalledWith(
        expect.objectContaining({
          data: expected.map(convertSubChannelFromRaw).map(getSubChannelMessagePreviewWithUser),
          loading: false,
          error: undefined,
          hasNextPage: false,
        }),
      );
    });
  });

  test('when querying two subchannel collections with the same channelId but different params, results are distinct', async () => {
    const callback = jest.fn();
    const callback2 = jest.fn();
    const subChannel = generateRawSubChannel({
      channelPublicId: 'channel1',
      messageFeedId: 'channel1-subChannel1',
    });
    const subChannel2 = generateRawSubChannel({
      channelPublicId: 'channel1',
      lastMessageId: 'thisissubchannelforanothercase',
      messageFeedId: 'channel1-subChannel2',
    });
    const defaultSubChannel = generateRawSubChannel({
      channelPublicId: 'channel1',
      lastMessageId: 'thisisdefault',
      messageFeedId: 'channel1',
    });

    client.http.get = jest.fn().mockImplementation((url, params) => {
      if (params.params?.excludeDefaultMessageFeed === false) {
        return Promise.resolve({
          data: {
            messageFeeds: [defaultSubChannel, subChannel],
            messages: [],
            users: [],
            files: [],
            paging: {},
          },
        });
      }
      return Promise.resolve({
        data: {
          messageFeeds: [subChannel2],
          messages: [],
          users: [],
          files: [],
          paging: {},
        },
      });
    });

    getSubChannels({ channelId: 'channel1', excludeDefaultSubChannel: false }, callback);
    getSubChannels({ channelId: 'channel1', excludeDefaultSubChannel: true }, callback2);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [],
        error: undefined,
        loading: true,
      }),
    );

    await pause(100);

    expect(callback.mock.calls.length).toBe(2);
    /**
     * excludeDefaultSubChannel: false
     * should return [defaultSubChannel, subChannel];
     */
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [defaultSubChannel, subChannel]
          .map(convertSubChannelFromRaw)
          .map(getSubChannelMessagePreviewWithUser),
        error: undefined,
        hasNextPage: false,
        loading: false,
      }),
    );

    expect(callback2.mock.calls.length).toBe(2);
    expect(callback2).lastCalledWith(
      expect.objectContaining({
        data: [{ ...convertSubChannelFromRaw(subChannel2), messagePreview: null }],
        error: undefined,
        loading: false,
      }),
    );
  });

  describe('events', () => {
    const newRawSubChannel = generateRawSubChannel({
      messageFeedId: 'sub-channel-id-2',
      lastMessageTimestamp: getFutureDate(rawSubChannel.lastMessageTimestamp),
    });
    const updatedRawSubChannel = {
      ...rawSubChannel,
      name: 'new name',
      updatedAt: getFutureDate(rawSubChannel.updatedAt),
    };
    const deletedRawSubChannel = {
      ...rawSubChannel,
      isDeleted: true,
      updatedAt: getFutureDate(rawSubChannel.updatedAt),
    };

    const cases: [string, keyof Amity.Events, Amity.RawSubChannel, Amity.SubChannel[]][] = [
      [
        'should add new sub channel to collection onCreate',
        'message-feed.created',
        newRawSubChannel,
        [newRawSubChannel, rawSubChannel]
          .map(data => convertSubChannelFromRaw(data))
          .map(subChannel => {
            return { ...subChannel, messagePreview: null };
          }),
      ],
      [
        'should remove sub channel from collection onDelete',
        'message-feed.deleted',
        deletedRawSubChannel,
        [],
      ],
      [
        'should update sub channel in collection onUpdate',
        'message-feed.updated',
        updatedRawSubChannel,
        [updatedRawSubChannel]
          .map(data => convertSubChannelFromRaw(data))
          .map(subChannel => {
            return { ...subChannel, messagePreview: null };
          }),
      ],
      [
        'should update sub channel in collection onFetch',
        'local.message-feed.fetched',
        updatedRawSubChannel,
        [updatedRawSubChannel]
          .map(data => convertSubChannelFromRaw(data))
          .map(subChannel => {
            return { ...subChannel, messagePreview: null };
          }),
      ],
    ];

    type testHandlerType = (...args: typeof cases[number]) => Promise<void>;
    const testHandler: testHandlerType = async (test, event, rawEventSubChannel, expected) => {
      const callback = jest.fn();
      client.http.get = jest.fn().mockResolvedValue(response);

      getSubChannels({ channelId: rawSubChannel.channelPublicId, includeDeleted: false }, callback);
      await pause();
      if (event === 'local.message-feed.fetched') {
        pushToCache(
          ['subChannel', 'get', rawEventSubChannel.messageFeedId],
          convertSubChannelFromRaw(rawEventSubChannel),
        );
        client.emitter.emit(event, {
          messageFeeds: [convertSubChannelFromRaw(rawEventSubChannel)],
          messages: [],
          users: [],
          files: [],
        });
      } else {
        client.emitter.emit(event, {
          messageFeeds: [rawEventSubChannel],
          messages: [],
          users: [],
          files: [],
        });
      }
      await pause();

      expect(callback).toHaveBeenCalledTimes(3);
      expect(callback).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({
          data: expected,
          loading: false,
        }),
      );
    };

    test.each(cases)('%s', testHandler);
  });
});
