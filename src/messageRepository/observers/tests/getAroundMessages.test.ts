import { disableCache, enableCache } from '~/cache/api';

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

import { getMessages } from '../getMessages';
import * as getMessageMarkers from '../../../marker/api/getMessageMarkers';

describe('getMessages by aroundMessageId (Jump to message)', () => {
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

  it('should return messages collection when jumping to a message and pagination works correctly', async () => {
    /**
     * descending order
     * [100,99,98,97,96,95,94,93,92]
     * << Previous | Next >>
     */
    const returnValuePage1: Amity.RawMessage[] = [
      generateRawMessage({ messageId: messagesDesc.page2[0], segment: 97 }),
      generateRawMessage({ messageId: messagesDesc.page2[1], segment: 96 }), // aroundMessageId
      generateRawMessage({ messageId: messagesDesc.page2[2], segment: 95 }),
    ];

    const returnValuePage2Previous: Amity.RawMessage[] = [
      generateRawMessage({ messageId: messagesDesc.page1[0], segment: 100 }),
      generateRawMessage({ messageId: messagesDesc.page1[1], segment: 99 }),
      generateRawMessage({ messageId: messagesDesc.page1[2], segment: 98 }),
    ];

    const returnValuePage2Next: Amity.RawMessage[] = [
      generateRawMessage({ messageId: messagesDesc.page3[0], segment: 94 }),
      generateRawMessage({ messageId: messagesDesc.page3[1], segment: 93 }),
      generateRawMessage({ messageId: messagesDesc.page3[2], segment: 92 }),
    ];

    const aroundMessageId = messagesDesc.page2[1];

    const callback = jest.fn();

    const spyGet = jest.spyOn(client.http, 'get').mockImplementation((url: string, params) => {
      if (url !== '/api/v5/messages') return Promise.resolve();

      // segmentDesc nextPage#2
      if (params?.params?.options?.token === 'eyJsaW1pdCI6MywiYmVmb3JlIjoibWVzc2FnZUlkMTAxIn0=') {
        return Promise.resolve({
          data: {
            messages: returnValuePage2Next,
            paging: {
              previous: 'eyJsaW1pdCI6MiwiYmVmb3JlIjo2MzQ3MTYxNDM5MTExMTAwMDAwMH0',
            },
          },
        });
      }

      // segmentDesc previousPage#2
      if (
        params?.params?.options?.token === 'eyJsaW1pdCI6MiwiYmVmb3JlIjo2MzQ3MTYxNDM5MTExMTAwMDAwMH0'
      ) {
        return Promise.resolve({
          data: {
            messages: returnValuePage2Previous,
            paging: {
              previous: 'eyJsaW1pdCI6MiwiYmVmb3JlIjo2MzQ3MTYxNDM5MTExMTAwMDAwMH0',
              next: 'eyJsaW1pdCI6MiwiYmVmb3JlIjo2MzQ3MTYxNDQ5MTExMTAwMDAwMH0=',
            },
          },
        });
      }

      // segmentDesc page#1
      return Promise.resolve({
        data: {
          messages: returnValuePage1,
          paging: {
            previous: 'eyJsaW1pdCI6MiwiYmVmb3JlIjo2MzQ3MTYxNDM5MTExMTAwMDAwMH0',
            next: 'eyJsaW1pdCI6MywiYmVmb3JlIjoibWVzc2FnZUlkMTAxIn0=',
          },
        },
      });
    });

    getMessages({ subChannelId, sortBy: 'segmentDesc', aroundMessageId, limit: 3 }, callback);

    expect(spyGet).toHaveBeenCalledWith('/api/v5/messages', {
      params: {
        isDeleted: false,
        messageFeedId: 'message-feed-id',
        options: { sortBy: 'segmentDesc', limit: 3, around: aroundMessageId },
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
        data: returnValuePage1.map(convertRawMessage),
        error: undefined,
        loading: false,
      }),
    );

    const { onNextPage, hasNextPage, onPrevPage, hasPrevPage } = callback.mock.lastCall[0];

    expect(hasNextPage).toBe(true);
    expect(onNextPage).toBeTruthy();

    expect(hasPrevPage).toBe(true);
    expect(onPrevPage).toBeTruthy();

    onNextPage();
    await pause(100);

    expect(callback.mock.calls.length).toBeGreaterThan(3);
    expect(callback).lastCalledWith(
      expect.objectContaining({
        data: [...returnValuePage1, ...returnValuePage2Next].map(convertRawMessage),
        error: undefined,
        loading: false,
      }),
    );

    const {
      onNextPage: newOnNextPage,
      hasNextPage: newHasNextPage,
      onPrevPage: newOnPrevPage,
      hasPrevPage: newHasPrevPage,
    } = callback.mock.lastCall[0];

    expect(newHasNextPage).toBe(false);
    // TODO: check if onNextPage should be undefined or not
    // expect(newOnNextPage).toBeFalsy();

    expect(newHasPrevPage).toBe(true);
    expect(newOnPrevPage).toBeTruthy();

    newOnPrevPage();
    await pause(100);

    expect(callback.mock.calls.length).toBeGreaterThan(5);
    expect(callback).lastCalledWith(
      expect.objectContaining({
        data: [...returnValuePage2Previous, ...returnValuePage1, ...returnValuePage2Next].map(
          convertRawMessage,
        ),
        error: undefined,
        loading: false,
      }),
    );
  });

  it('should return erorr if target messageId is not found', async () => {
    const error = new Error('Amity SDK (400400): Target jump message not found!');

    const aroundMessageId = messagesDesc.page2[1];

    const callback = jest.fn();

    const spyGet = jest.spyOn(client.http, 'get').mockImplementation(() => {
      return Promise.reject(error);
    });

    getMessages({ subChannelId, sortBy: 'segmentDesc', aroundMessageId, limit: 3 }, callback);

    expect(spyGet).toHaveBeenCalledWith('/api/v5/messages', {
      params: {
        isDeleted: false,
        messageFeedId: 'message-feed-id',
        options: { sortBy: 'segmentDesc', limit: 3, around: aroundMessageId },
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
        data: [],
        error,
        loading: false,
      }),
    );
  });

  describe('Event', () => {
    it('should prepend new message if sortBy segmentDsc and hasPrevPage = false', async () => {
      const returnValue: Amity.RawMessage[] = [
        generateRawMessage({ messageId: messagesDesc.page1[0], segment: 100 }),
        generateRawMessage({ messageId: messagesDesc.page1[1], segment: 99 }), // aroundMessageId
        generateRawMessage({ messageId: messagesDesc.page1[2], segment: 98 }),
      ];

      const newMessage = generateRawMessage({ messageId: 'newMessageId', segment: 101 });

      const aroundMessageId = messagesDesc.page1[1];

      const callback = jest.fn();

      const spyGet = jest.spyOn(client.http, 'get').mockImplementation((url: string, params) => {
        if (url !== '/api/v5/messages') return Promise.resolve();

        return Promise.resolve({
          data: {
            messages: returnValue,
            paging: {
              next: 'eyJsaW1pdCI6MywiYmVmb3JlIjoibWVzc2FnZUlkMTAxIn0=',
            },
          },
        });
      });

      getMessages({ subChannelId, sortBy: 'segmentDesc', aroundMessageId, limit: 3 }, callback);

      expect(spyGet).toHaveBeenCalledWith('/api/v5/messages', {
        params: {
          isDeleted: false,
          messageFeedId: 'message-feed-id',
          options: { sortBy: 'segmentDesc', limit: 3, around: aroundMessageId },
        },
      });

      await pause(100);

      client.emitter.emit('message.created', {
        messages: [newMessage],
        users: [],
        files: [],
        reactions: [],
      });

      await pause(100);

      expect(callback.mock.calls.length).toBeGreaterThan(2);
      expect(callback).lastCalledWith(
        expect.objectContaining({
          data: [newMessage, ...returnValue].map(convertRawMessage),
          error: undefined,
          loading: false,
        }),
      );
    });

    it('should not prepend new message if sortBy segmentDsc and hasPrevPage = true', async () => {
      const returnValue: Amity.RawMessage[] = [
        generateRawMessage({ messageId: messagesDesc.page3[0], segment: 100 }),
        generateRawMessage({ messageId: messagesDesc.page3[1], segment: 99 }), // aroundMessageId
        generateRawMessage({ messageId: messagesDesc.page3[2], segment: 98 }),
      ];

      const newMessage = generateRawMessage({ messageId: 'newMessageId-105', segment: 102 });

      const aroundMessageId = messagesDesc.page3[1];

      const callback = jest.fn();

      const spyGet = jest.spyOn(client.http, 'get').mockImplementation((url: string, params) => {
        if (url !== '/api/v5/messages') return Promise.resolve();

        return Promise.resolve({
          data: {
            messages: returnValue,
            paging: {
              previous: 'eyJsaW1pdCI6MiwiYmVmb3JlIjo2MzQ3MTYxNDM5MTExMTAwMDAwMH0',
              next: 'eyJsaW1pdCI6MywiYmVmb3JlIjoibWVzc2FnZUlkMTAxIn0=',
            },
          },
        });
      });

      getMessages({ subChannelId, sortBy: 'segmentDesc', aroundMessageId, limit: 3 }, callback);

      expect(spyGet).toHaveBeenCalledWith('/api/v5/messages', {
        params: {
          isDeleted: false,
          messageFeedId: 'message-feed-id',
          options: { sortBy: 'segmentDesc', limit: 3, around: aroundMessageId },
        },
      });

      await pause(100);

      expect(callback.mock.calls.length).toBeGreaterThan(1);

      client.emitter.emit('message.created', {
        messages: [newMessage],
        users: [],
        files: [],
        reactions: [],
      });

      await pause(100);

      expect(callback).toBeCalledTimes(2);
      expect(callback).lastCalledWith(
        expect.objectContaining({
          data: returnValue.map(convertRawMessage),
          error: undefined,
          loading: false,
        }),
      );
    });

    it('should append new message if sortBy segmentAsc and hasNextPage = false', async () => {
      const returnValue: Amity.RawMessage[] = [
        generateRawMessage({ messageId: messages.page1[0], segment: 1 }),
        generateRawMessage({ messageId: messages.page1[1], segment: 2 }), // aroundMessageId
        generateRawMessage({ messageId: messages.page1[2], segment: 3 }),
      ];

      const newMessage = generateRawMessage({ messageId: 'newMessageId', segment: 4 });

      const aroundMessageId = messages.page1[1];

      const callback = jest.fn();

      const spyGet = jest.spyOn(client.http, 'get').mockImplementation((url: string, params) => {
        if (url !== '/api/v5/messages') return Promise.resolve();

        return Promise.resolve({
          data: {
            messages: returnValue,
            paging: {
              prev: 'eyJsaW1pdCI6MywiYmVmb3JlIjoibWVzc2FnZUlkMTAxIn0=',
            },
          },
        });
      });

      getMessages({ subChannelId, sortBy: 'segmentAsc', aroundMessageId, limit: 3 }, callback);

      expect(spyGet).toHaveBeenCalledWith('/api/v5/messages', {
        params: {
          isDeleted: false,
          messageFeedId: 'message-feed-id',
          options: { sortBy: 'segmentAsc', limit: 3, around: aroundMessageId },
        },
      });

      await pause(100);

      client.emitter.emit('message.created', {
        messages: [newMessage],
        users: [],
        files: [],
        reactions: [],
      });

      await pause(100);

      expect(callback.mock.calls.length).toBeGreaterThan(2);
      expect(callback).lastCalledWith(
        expect.objectContaining({
          data: [...returnValue, newMessage].map(convertRawMessage),
          error: undefined,
          loading: false,
        }),
      );
    });

    it('should not append new message if sortBy segmentAsc and hasNextPage = true', async () => {
      const returnValue: Amity.RawMessage[] = [
        generateRawMessage({ messageId: messages.page2[0], segment: 1 }),
        generateRawMessage({ messageId: messages.page2[1], segment: 2 }), // aroundMessageId
        generateRawMessage({ messageId: messages.page2[2], segment: 3 }),
      ];

      const newMessage = generateRawMessage({ messageId: 'newMessageId', segment: 4 });

      const aroundMessageId = messages.page2[1];

      const callback = jest.fn();

      const spyGet = jest.spyOn(client.http, 'get').mockImplementation((url: string, params) => {
        if (url !== '/api/v5/messages') return Promise.resolve();

        return Promise.resolve({
          data: {
            messages: returnValue,
            paging: {
              previous: 'eyJsaW1pdCI6MiwiYmVmb3JlIjo2MzQ3MTYxNDM5MTExMTAwMDAwMH0',
              next: 'eyJsaW1pdCI6MywiYmVmb3JlIjoibWVzc2FnZUlkMTAxIn0=',
            },
          },
        });
      });

      getMessages({ subChannelId, sortBy: 'segmentAsc', aroundMessageId, limit: 3 }, callback);

      expect(spyGet).toHaveBeenCalledWith('/api/v5/messages', {
        params: {
          isDeleted: false,
          messageFeedId: 'message-feed-id',
          options: { sortBy: 'segmentAsc', limit: 3, around: aroundMessageId },
        },
      });

      await pause(100);

      client.emitter.emit('message.created', {
        messages: [newMessage],
        users: [],
        files: [],
        reactions: [],
      });

      await pause(100);

      expect(callback).toBeCalledTimes(2);
      expect(callback).lastCalledWith(
        expect.objectContaining({
          data: returnValue.map(convertRawMessage),
          error: undefined,
          loading: false,
        }),
      );
    });
  });
});
