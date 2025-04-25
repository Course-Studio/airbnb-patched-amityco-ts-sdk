import { ASCApiError } from '~/core/errors';
import { disableCache, enableCache } from '~/cache/api';
import { ENABLE_CACHE_MESSAGE } from '~/utils/constants';
import {
  client,
  connectClient,
  disconnectClient,
  messages,
  generateRawMessage,
  convertRawMessage,
  pause,
  messagesDesc,
} from '~/utils/tests';

import { queryMessages } from '../../api/queryMessages';
import { getMessages } from '../getMessages';
import * as getMessageMarkers from '../../../marker/api/getMessageMarkers';

describe('getMessages', () => {
  beforeAll(() => {
    connectClient();

    jest.spyOn(getMessageMarkers, 'getMessageMarkers').mockImplementation(() =>
      Promise.resolve({
        data: [],
        cachedAt: undefined,
      }),
    );
  });

  afterAll(disconnectClient);

  beforeEach(enableCache);
  afterEach(disableCache);

  const { subChannelId } = messages;
  const returnValue: Amity.RawMessage[] = [generateRawMessage({ messageId: messages.page1[0] })];
  const rawMessage = generateRawMessage({
    messageId: returnValue[0].messageId,
    messageFeedId: subChannelId,
  });
  const message = convertRawMessage(rawMessage);

  test('it should show message if cache not enabled', () => {
    /*
     * NOTE: at the time of writing this test cache is diabled by default, but
     * there is a proposal to enable cache by default. So I'm disabling cache
     * here to ensure cache is disabled
     */
    disableCache();

    const callback = jest.fn();
    jest.spyOn(global.console, 'log');
    client.http.get = jest.fn();

    // call getMessages check if mocked console get's called with the correct
    // message
    client.use();
    getMessages({ subChannelId }, callback);

    expect(console.log).toBeCalledWith(ENABLE_CACHE_MESSAGE);
  });

  test('it should return message collection', async () => {
    // mock response of queryMessages and validate
    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue({
      data: {
        messages: returnValue,
        paging: {},
      },
    });

    getMessages({ subChannelId }, callback);
    await pause();

    expect(callback).toHaveBeenCalledTimes(2);

    expect(callback).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        data: [],
        error: undefined,
        loading: true,
      }),
    );

    expect(callback).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        data: returnValue.map(convertRawMessage),
        error: undefined,
        loading: false,
      }),
    );
  });

  test('it should return error on api failure', async () => {
    const error = new ASCApiError(
      'server error!',
      Amity.ServerError.ITEM_NOT_FOUND,
      Amity.ErrorLevel.ERROR,
    );

    // mock response of queryMessages and validate
    const callback = jest.fn();
    client.http.get = jest.fn().mockRejectedValue(error);

    getMessages({ subChannelId }, callback);
    await pause();

    expect(callback).toHaveBeenCalledTimes(2);

    // check if cache data returned (should be empty)
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [],
        error: undefined,
        loading: true,
      }),
    );

    await expect(queryMessages({ subChannelId })).rejects.toThrow();

    expect(callback).toHaveBeenCalledTimes(2);

    expect(callback).toHaveBeenLastCalledWith(
      expect.objectContaining({
        error,
        data: [],
        loading: false,
      }),
    );
  });

  test('it should filter deleted messages based on param', async () => {
    // mock response of queryMessages with a deleted message
    const returnValue = [
      { messageId: messages.page1[0], isDeleted: true },
      { messageId: messages.page1[1], isDeleted: false },
    ];

    // mock response of queryMessages and validate
    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue({
      data: {
        messages: returnValue,
        paging: {},
      },
    });

    getMessages({ subChannelId, includeDeleted: false }, callback);
    await pause();

    // not use queryMessages anymore
    // await expect(queryMessages({ subChannelId })).resolves.toBeTruthy();

    expect(callback).toHaveBeenCalledTimes(2);

    // check if cache data returned (should be empty)
    expect(callback).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        data: [],
        error: undefined,
        loading: true,
      }),
    );

    expect(callback).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        // @ts-ignore
        data: [returnValue[1]].map(convertRawMessage),
        error: undefined,
        loading: false,
      }),
    );
  });

  test('it should return method to fetch next page', async () => {
    const returnValue2 = [{ messageId: messages.page2[0] }];

    const callback = jest.fn();
    client.http.get = jest
      .fn()
      .mockResolvedValue({
        data: {
          messages: returnValue,
          paging: {
            previous: 'eyJsaW1pdCI6MiwiYmVmb3JlIjo2MzQ3MTYxNDM5MTExMTAwMDAwMH0',
            next: 'eyJsaW1pdCI6MiwiYmVmb3JlIjo2MzQ3MTYxNDM5MTExMTAwMDAwMH0',
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          messages: returnValue2,
          paging: {
            previous: 'eyJsaW1pdCI6MiwiYmVmb3JlIjo2MzQ3MTYxNDM5MTExMTAwMDAwMH0',
            next: 'eyJsaW1pdCI6MiwiYmVmb3JlIjo2MzQ3MTYxNDM5MTExMTAwMDAwMH0',
          },
        },
      });

    getMessages({ subChannelId, includeDeleted: true }, callback);
    await pause();

    expect(callback).toHaveBeenCalled();

    // await expect(queryMessages({ subChannelId })).resolves.toBeTruthy();

    expect(callback.mock.lastCall).toHaveLength(1);

    const { onNextPage, hasNextPage } = callback.mock.lastCall[0];

    expect(hasNextPage).toBe(true);
    expect(onNextPage).toBeTruthy();

    onNextPage();
    await pause();

    // await expect(queryMessages({ subChannelId })).resolves.toBeTruthy();

    // 4 -> becuase 1 local & server call each per call (2)
    expect(callback).toHaveBeenCalledTimes(4);

    expect(callback).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({
        // @ts-ignore
        data: [...returnValue2, ...returnValue].map(convertRawMessage),
        error: undefined,
        loading: false,
      }),
    );
  });

  // skip this test for now because onFecth should not add a new message to the collection
  test.skip('it should add new message to collection onFetch', async () => {
    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue({
      data: {
        messages: returnValue,
        paging: {},
      },
    });

    getMessages({ subChannelId }, callback);
    await pause();

    // await expect(queryMessages({ subChannelId })).resolves.toBeTruthy();
    expect(callback).toHaveBeenCalledTimes(2);

    client.emitter.emit('local.message.fetched', { messages: [message] });

    expect(callback).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        data: [message],
        error: undefined,
        loading: false,
      }),
    );
  });

  test('it should add new message to collection onCreate', async () => {
    const rawNewMessage = generateRawMessage({
      messageId: 'new-message-id',
      messageFeedId: message.subChannelId,
    });
    const newMessage = convertRawMessage(rawNewMessage);

    // mock response of queryMessages and validate
    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue({
      data: {
        messages: returnValue,
        paging: {},
      },
    });

    getMessages({ subChannelId }, callback);
    await pause();

    // await expect(queryMessages({ subChannelId })).resolves.toBeTruthy();
    expect(callback).toHaveBeenCalledTimes(2);

    // fire new message creation event
    client.emitter.emit('message.created', {
      messages: [rawNewMessage],
      messageFeeds: [],
      users: [],
      files: [],
      reactions: [],
    });

    await pause();

    expect(callback).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        error: undefined,
        loading: false,
      }),
    );
    expect(callback.mock.calls[2][0].data[0]).toMatchObject(newMessage);
    expect(callback.mock.calls[2][0].data[1]).toMatchObject(message);
  });

  test('it should add new message to collection onUpdate', async () => {
    // mock response of queryMessages and validate
    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue({
      data: {
        messages: returnValue,
        paging: {},
      },
    });

    getMessages({ subChannelId }, callback);
    await pause();

    // await expect(queryMessages({ subChannelId })).resolves.toBeTruthy();
    expect(callback).toHaveBeenCalledTimes(2);

    // fire new message creation event
    client.emitter.emit('message.updated', {
      messages: [rawMessage],
      messageFeeds: [],
      users: [],
      files: [],
      reactions: [],
    });

    expect(callback).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        data: [message],
        error: undefined,
        loading: false,
      }),
    );
  });

  test('it should add new message to collection onDelete', async () => {
    // mock response of queryMessages and validate
    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue({
      data: {
        messages: returnValue,
        paging: {},
      },
    });

    getMessages({ subChannelId, includeDeleted: true }, callback);
    await pause();

    // await expect(queryMessages({ subChannelId })).resolves.toBeTruthy();
    expect(callback).toHaveBeenCalledTimes(2);

    // fire new message deletion event
    client.emitter.emit('message.deleted', {
      messages: [{ ...rawMessage, isDeleted: true }],
      messageFeeds: [],
      users: [],
      files: [],
      reactions: [],
    });

    await pause();

    expect(callback).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        data: [{ ...message, isDeleted: true }],
        error: undefined,
        loading: false,
      }),
    );
  });

  describe('when querying the message collection with specific sort and filter options, the result should be sorted correctly', () => {
    describe('sorting', () => {
      test('default', async () => {
        const { subChannelId } = messages;
        const returnValue: Amity.RawMessage[] = [
          generateRawMessage({ messageId: messages.page3[2], segment: 9 }),
          generateRawMessage({ messageId: messages.page3[1], segment: 8 }),
          generateRawMessage({ messageId: messages.page3[0], segment: 7 }),
        ];

        const callback = jest.fn();
        const spyGet = jest.spyOn(client.http, 'get').mockResolvedValue({
          data: {
            messages: returnValue,
            paging: {},
          },
        });

        getMessages({ subChannelId }, callback);

        expect(spyGet).toHaveBeenCalledWith('/api/v5/messages', {
          params: {
            isDeleted: false,
            messageFeedId: 'message-feed-id',
            // first time call will not have token, message set limit to COLLECTION_DEFAULT_PAGINATION_LIMIT by default
            options: { limit: 5 },
          },
        });

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(
          expect.objectContaining({
            data: [],
            error: undefined,
            loading: true,
          }),
        );

        await pause(100);

        expect(callback.mock.calls.length).toBeGreaterThan(1);
        expect(callback).lastCalledWith(
          expect.objectContaining({
            data: returnValue.map(convertRawMessage),
            error: undefined,
            loading: false,
          }),
        );
      });

      test('segmentDesc', async () => {
        const { subChannelId } = messages;
        const returnValue: Amity.RawMessage[] = [
          generateRawMessage({ messageId: messages.page3[2], segment: 9 }),
          generateRawMessage({ messageId: messages.page3[1], segment: 8 }),
          generateRawMessage({ messageId: messages.page3[0], segment: 7 }),
        ];

        const callback = jest.fn();
        const spyGet = jest.spyOn(client.http, 'get').mockResolvedValue({
          data: {
            messages: returnValue,
            paging: {},
          },
        });

        getMessages({ subChannelId, sortBy: 'segmentDesc' }, callback);

        expect(spyGet).toHaveBeenCalledWith('/api/v5/messages', {
          params: {
            isDeleted: false,
            messageFeedId: 'message-feed-id',
            options: {
              sortBy: 'segmentDesc',
              // first time call will not have token, message set limit to COLLECTION_DEFAULT_PAGINATION_LIMIT by default
              limit: 5,
            },
          },
        });

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(
          expect.objectContaining({
            data: [],
            error: undefined,
            loading: true,
          }),
        );

        await pause(100);

        expect(callback.mock.calls.length).toBeGreaterThan(1);
        expect(callback).lastCalledWith(
          expect.objectContaining({
            data: returnValue.map(convertRawMessage),
            error: undefined,
            loading: false,
          }),
        );
      });

      test('segmentDesc + wrong ordering from server', async () => {
        const { subChannelId } = messages;
        const returnValue: Amity.RawMessage[] = [
          generateRawMessage({ messageId: messages.page3[0], segment: 7 }),
          generateRawMessage({ messageId: messages.page3[1], segment: 8 }),
          generateRawMessage({ messageId: messages.page3[2], segment: 9 }),
        ];

        const callback = jest.fn();
        const spyGet = jest.spyOn(client.http, 'get').mockResolvedValue({
          data: {
            messages: returnValue,
            paging: {},
          },
        });

        getMessages({ subChannelId, sortBy: 'segmentDesc' }, callback);

        expect(spyGet).toHaveBeenCalledWith('/api/v5/messages', {
          params: {
            isDeleted: false,
            messageFeedId: 'message-feed-id',
            options: {
              sortBy: 'segmentDesc',
              // first time call will not have token, message set limit to COLLECTION_DEFAULT_PAGINATION_LIMIT by default
              limit: 5,
            },
          },
        });

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(
          expect.objectContaining({
            data: [],
            error: undefined,
            loading: true,
          }),
        );

        await pause(100);

        expect(callback.mock.calls.length).toBeGreaterThan(1);
        expect(callback).lastCalledWith(
          expect.objectContaining({
            data: [
              convertRawMessage(returnValue[2]),
              convertRawMessage(returnValue[1]),
              convertRawMessage(returnValue[0]),
            ],
            error: undefined,
            loading: false,
          }),
        );
      });

      test('segmentAsc', async () => {
        const { subChannelId } = messages;
        const returnValue: Amity.RawMessage[] = [
          generateRawMessage({ messageId: messages.page1[0], segment: 1 }),
          generateRawMessage({ messageId: messages.page1[1], segment: 2 }),
          generateRawMessage({ messageId: messages.page1[2], segment: 3 }),
        ];

        const callback = jest.fn();
        const spyGet = jest.spyOn(client.http, 'get').mockResolvedValue({
          data: {
            messages: returnValue,
            paging: {},
          },
        });

        getMessages({ subChannelId, sortBy: 'segmentAsc' }, callback);

        expect(spyGet).toHaveBeenCalledWith('/api/v5/messages', {
          params: {
            isDeleted: false,
            messageFeedId: 'message-feed-id',
            options: {
              sortBy: 'segmentAsc',
              // first time call will not have token, message set limit to COLLECTION_DEFAULT_PAGINATION_LIMIT by default
              limit: 5,
            },
          },
        });

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(
          expect.objectContaining({
            data: [],
            error: undefined,
            loading: true,
          }),
        );

        await pause(100);

        expect(callback.mock.calls.length).toBeGreaterThan(1);
        expect(callback).lastCalledWith(
          expect.objectContaining({
            data: returnValue.map(convertRawMessage),
            error: undefined,
            loading: false,
          }),
        );
      });

      test('segmentAsc + wrong ordering from server', async () => {
        const { subChannelId } = messages;
        const returnValue: Amity.RawMessage[] = [
          generateRawMessage({ messageId: messages.page1[2], segment: 3 }),
          generateRawMessage({ messageId: messages.page1[1], segment: 2 }),
          generateRawMessage({ messageId: messages.page1[0], segment: 1 }),
        ];

        const callback = jest.fn();
        const spyGet = jest.spyOn(client.http, 'get').mockResolvedValue({
          data: {
            messages: returnValue,
            paging: {},
          },
        });

        getMessages({ subChannelId, sortBy: 'segmentAsc' }, callback);

        expect(spyGet).toHaveBeenCalledWith('/api/v5/messages', {
          params: {
            isDeleted: false,
            messageFeedId: 'message-feed-id',
            options: {
              sortBy: 'segmentAsc',
              // first time call will not have token, message set limit to COLLECTION_DEFAULT_PAGINATION_LIMIT by default
              limit: 5,
            },
          },
        });

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(
          expect.objectContaining({
            data: [],
            error: undefined,
            loading: true,
          }),
        );

        await pause(100);

        expect(callback.mock.calls.length).toBeGreaterThan(1);
        expect(callback).lastCalledWith(
          expect.objectContaining({
            data: [
              convertRawMessage(returnValue[2]),
              convertRawMessage(returnValue[1]),
              convertRawMessage(returnValue[0]),
            ],
            error: undefined,
            loading: false,
          }),
        );
      });
    });

    /**
     * TODO: check filtering test cases again
     * The filtering should be on server side when query message from API
     * But on SDK side, we should filter the message after we get the message RTE event from server
     */

    describe('filtering', () => {
      test('tags', async () => {
        const { subChannelId } = messages;
        const returnValue: Amity.RawMessage[] = [
          generateRawMessage({ messageId: messages.page3[2], tags: ['tag1'] }),
          generateRawMessage({ messageId: messages.page3[1], tags: ['tag2'] }),
          generateRawMessage({ messageId: messages.page3[0], tags: ['tag3'] }),
        ];

        const callback = jest.fn();
        const spyGet = jest.spyOn(client.http, 'get').mockResolvedValue({
          data: {
            messages: returnValue,
            paging: {},
          },
        });

        getMessages({ subChannelId, tags: ['tag1', 'tag2'] }, callback);

        expect(spyGet).toHaveBeenCalledWith('/api/v5/messages', {
          params: {
            isDeleted: false,
            messageFeedId: 'message-feed-id',
            includeTags: ['tag1', 'tag2'],
            options: { limit: 5 },
          },
        });

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(
          expect.objectContaining({
            data: [],
            error: undefined,
            loading: true,
          }),
        );

        await pause(100);

        expect(callback.mock.calls.length).toBeGreaterThan(1);
        expect(callback).lastCalledWith(
          expect.objectContaining({
            data: [convertRawMessage(returnValue[0]), convertRawMessage(returnValue[1])],
            error: undefined,
            loading: false,
          }),
        );
      });

      test('excludeTags', async () => {
        const { subChannelId } = messages;
        const returnValue: Amity.RawMessage[] = [
          generateRawMessage({ messageId: messages.page3[2], tags: ['tag1'] }),
          generateRawMessage({ messageId: messages.page3[1], tags: ['tag2'] }),
          generateRawMessage({ messageId: messages.page3[0], tags: ['tag3'] }),
        ];

        const callback = jest.fn();
        const spyGet = jest.spyOn(client.http, 'get').mockResolvedValue({
          data: {
            messages: returnValue,
            paging: {},
          },
        });

        // filtering out doesn't work when put more than 1 tag in excludeTags
        getMessages({ subChannelId, excludeTags: ['tag1'] }, callback);

        expect(spyGet).toHaveBeenCalledWith('/api/v5/messages', {
          params: {
            isDeleted: false,
            messageFeedId: 'message-feed-id',
            excludeTags: ['tag1'],
            options: { limit: 5 },
          },
        });

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(
          expect.objectContaining({
            data: [],
            error: undefined,
            loading: true,
          }),
        );

        await pause(100);

        expect(callback.mock.calls.length).toBeGreaterThan(1);
        expect(callback).lastCalledWith(
          expect.objectContaining({
            data: [convertRawMessage(returnValue[1]), convertRawMessage(returnValue[2])],
            error: undefined,
            loading: false,
          }),
        );
      });

      test('dataType', async () => {
        const { subChannelId } = messages;
        const returnValue: Amity.RawMessage[] = [
          generateRawMessage({ messageId: messages.page3[2], dataType: 'text' }),
          generateRawMessage({ messageId: messages.page3[1], dataType: 'image' }),
          generateRawMessage({ messageId: messages.page3[0], dataType: 'video' }),
        ];

        const callback = jest.fn();
        // dataType filtering by server, so query messages api v5 response from server will return only image dataType
        const spyGet = jest.spyOn(client.http, 'get').mockResolvedValue({
          data: {
            messages: [returnValue[1]],
            paging: {},
          },
        });

        getMessages({ subChannelId, dataType: 'image' }, callback);

        expect(spyGet).toHaveBeenCalledWith('/api/v5/messages', {
          params: {
            isDeleted: false,
            messageFeedId: 'message-feed-id',
            dataType: 'image',
            options: { limit: 5 },
          },
        });

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(
          expect.objectContaining({
            data: [],
            error: undefined,
            loading: true,
          }),
        );

        await pause(100);

        expect(callback.mock.calls.length).toBeGreaterThan(1);
        expect(callback).lastCalledWith(
          expect.objectContaining({
            data: [convertRawMessage(returnValue[1])],
            error: undefined,
            loading: false,
          }),
        );
      });

      test('parentId', async () => {
        const { subChannelId } = messages;
        const parentId = 'parent-id';
        const returnValue: Amity.RawMessage[] = [
          generateRawMessage({ messageId: messages.page3[2], parentId }),
          generateRawMessage({ messageId: messages.page3[1], parentId }),
          generateRawMessage({ messageId: messages.page3[0], parentId: 'parent-id-2' }),
        ];

        // parentId filtering by server,
        // query messages api v5 from server will return only that parentId

        const callback = jest.fn();
        const spyGet = jest.spyOn(client.http, 'get').mockResolvedValue({
          data: {
            messages: [returnValue[0], returnValue[1]],
            paging: {},
          },
        });

        getMessages({ subChannelId, parentId }, callback);

        expect(spyGet).toHaveBeenCalledWith('/api/v5/messages', {
          params: {
            isDeleted: false,
            messageFeedId: 'message-feed-id',
            parentId,
            options: { limit: 5 },
          },
        });

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(
          expect.objectContaining({
            data: [],
            error: undefined,
            loading: true,
          }),
        );

        await pause(100);

        expect(callback.mock.calls.length).toBeGreaterThan(1);
        expect(callback).lastCalledWith(
          expect.objectContaining({
            data: [convertRawMessage(returnValue[0]), convertRawMessage(returnValue[1])],
            error: undefined,
            loading: false,
          }),
        );
      });
    });

    describe('combine sorting + filtering', () => {
      test('segmentAsc + tags', async () => {
        const { subChannelId } = messages;
        const returnValue: Amity.RawMessage[] = [
          generateRawMessage({ messageId: messages.page3[2], tags: ['tag1'], segment: 9 }),
          generateRawMessage({ messageId: messages.page3[1], tags: ['tag3'], segment: 8 }),
          generateRawMessage({ messageId: messages.page3[0], tags: ['tag2'], segment: 7 }),
          generateRawMessage({ messageId: messages.page2[2], tags: ['tag3'], segment: 6 }),
          generateRawMessage({ messageId: messages.page2[1], tags: ['tag3'], segment: 5 }),
        ];

        const callback = jest.fn();
        const spyGet = jest.spyOn(client.http, 'get').mockResolvedValue({
          data: {
            messages: returnValue,
            paging: {},
          },
        });

        getMessages({ subChannelId, tags: ['tag3'], sortBy: 'segmentAsc' }, callback);

        expect(spyGet).toHaveBeenCalledWith('/api/v5/messages', {
          params: {
            isDeleted: false,
            messageFeedId: 'message-feed-id',
            includeTags: ['tag3'],
            options: { sortBy: 'segmentAsc', limit: 5 },
          },
        });

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(
          expect.objectContaining({
            data: [],
            error: undefined,
            loading: true,
          }),
        );

        await pause(100);

        expect(callback.mock.calls.length).toBeGreaterThan(1);
        expect(callback).lastCalledWith(
          expect.objectContaining({
            data: [
              convertRawMessage(returnValue[4]),
              convertRawMessage(returnValue[3]),
              convertRawMessage(returnValue[1]),
            ],
            error: undefined,
            loading: false,
          }),
        );
      });
    });
  });

  test('when querying two message collections with the same subchannelId but different params, results do not mix with each other.', async () => {
    const callback = jest.fn();
    const callback2 = jest.fn();

    const { subChannelId } = messages;
    const returnValue: Amity.RawMessage[] = [
      generateRawMessage({ messageId: messages.page3[2], segment: 9 }),
      generateRawMessage({ messageId: messages.page3[1], segment: 8 }),
      generateRawMessage({ messageId: messages.page3[0], segment: 7 }),
    ];

    const returnValue2: Amity.RawMessage[] = [
      generateRawMessage({ messageId: messages.page1[0], segment: 1 }),
      generateRawMessage({ messageId: messages.page1[1], segment: 2 }),
      generateRawMessage({ messageId: messages.page1[2], segment: 3 }),
    ];

    const spyGet = jest.spyOn(client.http, 'get').mockImplementation((url: string, params) => {
      if (params?.params?.options?.sortBy === 'segmentDesc') {
        return Promise.resolve({
          data: {
            messages: returnValue,
            paging: {},
          },
        });
      }
      return Promise.resolve({
        data: {
          messages: returnValue2,
          paging: {},
        },
      });
    });

    getMessages({ subChannelId, sortBy: 'segmentDesc' }, callback);
    getMessages({ subChannelId, sortBy: 'segmentAsc' }, callback2);

    expect(spyGet).toHaveBeenCalledWith('/api/v5/messages', {
      params: {
        isDeleted: false,
        messageFeedId: 'message-feed-id',
        options: { sortBy: 'segmentDesc', limit: 5 },
      },
    });

    expect(spyGet).toHaveBeenCalledWith('/api/v5/messages', {
      params: {
        isDeleted: false,
        messageFeedId: 'message-feed-id',
        options: { sortBy: 'segmentAsc', limit: 5 },
      },
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [],
        error: undefined,
        loading: true,
      }),
    );

    await pause(100);

    expect(callback.mock.calls.length).toBeGreaterThan(1);
    expect(callback).lastCalledWith(
      expect.objectContaining({
        data: returnValue.map(convertRawMessage),
        error: undefined,
        loading: false,
      }),
    );

    expect(callback2.mock.calls.length).toBeGreaterThan(1);
    expect(callback2).lastCalledWith(
      expect.objectContaining({
        data: returnValue2.map(convertRawMessage),
        error: undefined,
        loading: false,
      }),
    );
  });

  test('when querying two message collections with the same subchannelId but different params, pagination works correctly for each.', async () => {
    const callback = jest.fn();
    const callback2 = jest.fn();

    const { subChannelId } = messages;
    // Value1 is for segmentDesc sorting
    const returnValue1Page1: Amity.RawMessage[] = [
      generateRawMessage({ messageId: messagesDesc.page1[0], segment: 100 }),
      generateRawMessage({ messageId: messagesDesc.page1[1], segment: 99 }),
      generateRawMessage({ messageId: messagesDesc.page1[2], segment: 98 }),
    ];

    const returnValue1Page2: Amity.RawMessage[] = [
      generateRawMessage({ messageId: messagesDesc.page2[0], segment: 97 }),
      generateRawMessage({ messageId: messagesDesc.page2[1], segment: 96 }),
      generateRawMessage({ messageId: messagesDesc.page2[2], segment: 95 }),
    ];

    // Value2 is for segmentAsc sorting
    const returnValue2Page1: Amity.RawMessage[] = [
      generateRawMessage({ messageId: messages.page1[0], segment: 1 }),
      generateRawMessage({ messageId: messages.page1[1], segment: 2 }),
      generateRawMessage({ messageId: messages.page1[2], segment: 3 }),
    ];

    const returnValue2Page2: Amity.RawMessage[] = [
      generateRawMessage({ messageId: messages.page2[0], segment: 4 }),
      generateRawMessage({ messageId: messages.page2[1], segment: 5 }),
      generateRawMessage({ messageId: messages.page2[2], segment: 6 }),
    ];

    const returnValue2Page3: Amity.RawMessage[] = [
      generateRawMessage({ messageId: messages.page3[0], segment: 7 }),
      generateRawMessage({ messageId: messages.page3[1], segment: 8 }),
      generateRawMessage({ messageId: messages.page3[2], segment: 9 }),
    ];

    const spyGet = jest.spyOn(client.http, 'get').mockImplementation((url: string, params) => {
      if (url !== '/api/v5/messages') return Promise.resolve();

      // segmentDesc page#1
      if (params?.params?.options?.sortBy === 'segmentDesc') {
        return Promise.resolve({
          data: {
            messages: returnValue1Page1,
            paging: {
              previous: 'eyJsaW1pdCI6MiwiYmVmb3JlIjo2MzQ3MTYxNDM5MTExMTAwMDAwMH0',
              next: 'eyJsaW1pdCI6MywiYmVmb3JlIjoibWVzc2FnZUlkMTAxIn0=',
            },
          },
        });
      }

      // segmentDesc page#2, option contains only token
      if (params?.params?.options?.token === 'eyJsaW1pdCI6MywiYmVmb3JlIjoibWVzc2FnZUlkMTAxIn0=') {
        return Promise.resolve({
          data: {
            messages: returnValue1Page2,
            paging: {
              previous: 'eyJsaW1pdCI6MiwiYmVmb3JlIjo2MzQ3MTYxNDM5MTExMTAwMDAwMH0',
            },
          },
        });
      }

      // segmentAsc page#2
      if (
        params?.params?.options?.token ===
        'eyJsaW1pdCI6MiwiYmVmb3JlIjo2MzQ3MTYxNDM5MTExMTAwMDAwMH0='
      ) {
        return Promise.resolve({
          data: {
            messages: returnValue2Page2,
            paging: {
              previous: 'eyJsaW1pdCI6MiwiYmVmb3JlIjo2MzQ3MTYxNDM5MTExMTAwMDAwMH0',
              next: 'eyJsaW1pdCI6MiwiYmVmb3JlIjo2MzQ3MTYxNDQ5MTExMTAwMDAwMH0=',
            },
          },
        });
      }

      // segmentAsc page#3
      if (
        params?.params?.options?.token ===
        'eyJsaW1pdCI6MiwiYmVmb3JlIjo2MzQ3MTYxNDQ5MTExMTAwMDAwMH0='
      ) {
        return Promise.resolve({
          data: {
            messages: returnValue2Page3,
            paging: {
              previous: 'eyJsaW1pdCI6MiwiYmVmb3JlIjo2MzQ3MTYxNDM5MTExMTAwMDAwMH0',
            },
          },
        });
      }

      // segmentAsc page#1
      return Promise.resolve({
        data: {
          messages: returnValue2Page1,
          paging: {
            previous: 'eyJsaW1pdCI6MiwiYmVmb3JlIjo2MzQ3MTYxNDM5MTExMTAwMDAwMH0',
            next: 'eyJsaW1pdCI6MiwiYmVmb3JlIjo2MzQ3MTYxNDM5MTExMTAwMDAwMH0=',
          },
        },
      });
    });

    getMessages({ subChannelId, sortBy: 'segmentDesc', limit: 3 }, callback);
    getMessages({ subChannelId, sortBy: 'segmentAsc', limit: 3 }, callback2);

    expect(spyGet).toHaveBeenCalledWith('/api/v5/messages', {
      params: {
        isDeleted: false,
        messageFeedId: 'message-feed-id',
        options: { sortBy: 'segmentDesc', limit: 3 },
      },
    });

    expect(spyGet).toHaveBeenCalledWith('/api/v5/messages', {
      params: {
        isDeleted: false,
        messageFeedId: 'message-feed-id',
        options: { sortBy: 'segmentAsc', limit: 3 },
      },
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [],
        error: undefined,
        loading: true,
      }),
    );

    await pause(100);

    expect(callback.mock.calls.length).toBeGreaterThan(1);
    expect(callback).lastCalledWith(
      expect.objectContaining({
        data: returnValue1Page1.map(convertRawMessage),
        error: undefined,
        loading: false,
      }),
    );

    // ge more page for live collection #2
    callback2.mock.lastCall[0].onNextPage();

    await pause(100);

    callback2.mock.lastCall[0].onNextPage();

    await pause(100);

    /**
     * collection #1
     * should contains 1 pages
     * should call the callback function 2 times
     */

    expect(callback.mock.calls.length).toBeGreaterThan(1);
    expect(callback).lastCalledWith(
      expect.objectContaining({
        data: returnValue1Page1.map(convertRawMessage),
        error: undefined,
        loading: false,
      }),
    );

    /**
     * collection #2
     * should contains 3 pages, because of 2 times calling onNextPage()
     * should call the callback function 6 times
     */

    expect(callback2.mock.calls.length).toBeGreaterThan(5);
    expect(callback2).lastCalledWith(
      expect.objectContaining({
        data: [...returnValue2Page1, ...returnValue2Page2, ...returnValue2Page3].map(
          convertRawMessage,
        ),
        error: undefined,
        loading: false,
      }),
    );

    // get more page for live collection #1
    callback.mock.lastCall[0].onNextPage();

    await pause(100);

    expect(callback).lastCalledWith(
      expect.objectContaining({
        data: [...returnValue1Page1, ...returnValue1Page2].map(convertRawMessage),
        error: undefined,
        loading: false,
      }),
    );
  });
});
