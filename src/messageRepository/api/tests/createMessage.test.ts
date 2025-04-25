import { ASCApiError } from '~/core/errors';
import { UNSYNCED_OBJECT_CACHED_AT_VALUE } from '~/utils/constants';
import { disableCache, enableCache, pullFromCache, pushToCache } from '~/cache/api';

import { client, convertRawMessage, generateRawMessage, pause } from '~/utils/tests';
import { createQuery, runQuery } from '~/core/query';

import { onMessageCreatedMqtt } from '../../events';
import { createMessage } from '../createMessage';
import * as getMessageMarkers from '../../../marker/api/getMessageMarkers';

const rawMessageToCreate = generateRawMessage();
const messageToCreate = convertRawMessage(rawMessageToCreate);
const { messageId, uniqueId, ...messageWithoutId } = messageToCreate;

describe('createMessage', () => {
  beforeAll(() => {
    jest.spyOn(getMessageMarkers, 'getMessageMarkers').mockImplementation(() =>
      Promise.resolve({
        data: [],
        cachedAt: undefined,
      }),
    );
  });

  const bundle = {
    data: messageToCreate.data,
    dataType: messageToCreate.dataType,
    referenceId: 'LOCAL_xxx',
    subChannelId: messageToCreate.subChannelId,
  };

  const response = {
    data: { messages: [rawMessageToCreate] },
  };

  beforeEach(enableCache);
  afterEach(disableCache);

  // integration_test_id: 9691969d-6ba8-4af6-93d6-dfe9134e9796
  test('should return created message', async () => {
    client.http.post = jest.fn().mockResolvedValue(response);

    const { data: created } = await createMessage(bundle);

    expect(created).toMatchObject(messageToCreate);
    expect(created.uniqueId).toBeDefined();
  });

  // integration_test_id: acc3be84-9234-4af1-88a1-cbb517fa247f
  test('should throw an 404300 if user has no permission', async () => {
    client.http.post = jest
      .fn()
      .mockRejectedValueOnce(
        new ASCApiError('forbidden', Amity.ServerError.FORBIDDEN, Amity.ErrorLevel.ERROR),
      );

    await expect(createMessage(messageWithoutId)).rejects.toThrow('400300');
  });

  test('should put message into cache', async () => {
    client.http.post = jest.fn().mockResolvedValue(response);

    const { data: created } = await createMessage(bundle);

    const cache = pullFromCache(['message', 'get', created.messageId]);
    expect(cache).toMatchObject({ data: messageWithoutId });
  });

  test('should fire event `onMessageCreated`', async () => {
    let dispose;
    client.http.post = jest.fn().mockResolvedValueOnce(response);

    const callbackPromise = new Promise(resolve => {
      dispose = onMessageCreatedMqtt(resolve);
    }).finally(dispose);

    await createMessage(messageWithoutId);

    await expect(callbackPromise).resolves.toMatchObject(messageWithoutId);
  });
});

// TODO: fix this test, because createMessage.optimistically is not exist anymore
describe('createMessage.optimistically', () => {
  beforeEach(enableCache);

  afterEach(disableCache);

  test('should create cache after created message', () => {
    const optimisticId = createMessage.optimistically(messageWithoutId)?.data?.messageId;
    const received = pullFromCache(['message', 'get', optimisticId])?.data;

    expect(received).toMatchObject(messageWithoutId);
  });

  describe('should increase message count after create message', () => {
    test('in sub channel', () => {
      const { channelId, subChannelId } = messageWithoutId;
      pushToCache(['channel', 'get', channelId], { channelId, messageCount: 2 });
      pushToCache(['subChannel', 'get', subChannelId], {
        channelId,
        subChannelId,
        messageCount: 2,
      });

      createMessage.optimistically(messageWithoutId);

      const cacheSubChannel = pullFromCache<Amity.SubChannel>([
        'subChannel',
        'get',
        subChannelId,
      ])?.data;

      expect(cacheSubChannel?.messageCount).toBe(3);
    });

    test('in channel if message created in main sub channel', () => {
      const { subChannelId } = messageWithoutId;
      pushToCache(['channel', 'get', subChannelId], { channelId: subChannelId, messageCount: 2 });
      pushToCache(['subChannel', 'get', subChannelId], {
        channelId: subChannelId,
        subChannelId,
        messageCount: 2,
      });

      createMessage.optimistically(messageWithoutId);

      const cacheChannel = pullFromCache<Amity.StaticInternalChannel>([
        'channel',
        'get',
        subChannelId,
      ])?.data;
      expect(cacheChannel?.messageCount).toBe(3);
    });
  });

  test('should fire event `onMessageCreated`', async () => {
    let dispose;

    const callbackPromise = new Promise(resolve => {
      dispose = onMessageCreatedMqtt(resolve);
    }).finally(dispose);

    createMessage.optimistically(messageWithoutId);

    await expect(callbackPromise).resolves.toMatchObject(messageWithoutId);
  });

  test('should define object as unsynced object', async () => {
    expect(createMessage.optimistically(messageWithoutId)?.cachedAt).toEqual(
      UNSYNCED_OBJECT_CACHED_AT_VALUE,
    );
  });
});

describe('uniqueId / referenceId', () => {
  const bundle = {
    data: messageToCreate.data,
    dataType: messageToCreate.dataType,
    subChannelId: messageToCreate.subChannelId,
  };

  beforeEach(enableCache);

  afterEach(disableCache);

  it('should optimistically create message with uniqueId', () => {
    const { data: message } = createMessage.optimistically(bundle)!;

    expect(message.uniqueId).toBeDefined();
    expect(message.uniqueId).toEqual(message.messageId);
  });

  it('should update messageId, retain uniqueId if optimistic message is in cache', async () => {
    const { data: optimisticMessage } = createMessage.optimistically(bundle)!;
    client.http.post = jest.fn().mockResolvedValue({
      data: { messages: [{ ...rawMessageToCreate, referenceId: optimisticMessage.uniqueId }] },
    });

    const { data: message } = await createMessage(bundle);

    expect(client.http.post as jest.Mock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ referenceId: optimisticMessage.uniqueId }),
    );
    expect(message.uniqueId).toEqual(optimisticMessage.uniqueId);
    expect(message.uniqueId).not.toEqual(message.messageId);
    expect(pullFromCache(['message', 'get', optimisticMessage.uniqueId])).toBeUndefined();
    expect(pullFromCache(['message', 'get', message.messageId])).toMatchObject({ data: message });
  });

  it('should set uniqueId to messageId if optimistic message is not in cache', async () => {
    const rawNewMessage = {
      ...rawMessageToCreate,
      messageId: 'new-message-id',
      referenceId: 'LOCAL_new-message-id',
    };
    const callback = jest.fn();

    onMessageCreatedMqtt(callback);
    client.emitter.emit('message.created', {
      messages: [rawNewMessage],
      messageFeeds: [],
      files: [],
      users: [],
      reactions: [],
    });
    await pause();

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        messageId: rawNewMessage.messageId,
        uniqueId: rawNewMessage.messageId,
      }),
    );
  });

  it('should pass referenceId if cache is turned off', async () => {
    disableCache();
    client.http.post = jest.fn().mockResolvedValue({ data: { messages: [rawMessageToCreate] } });

    runQuery(createQuery(createMessage, bundle));
    await pause();

    expect(client.http.post).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        referenceId: expect.stringMatching(/LOCAL_/),
      }),
    );
  });

  describe('custom referenceId', () => {
    it('should handle custom referenceId for optimistic message', () => {
      const referenceId = 'custom-reference-id';

      const { data: message } = createMessage.optimistically({ ...bundle, referenceId })!;

      expect(message.uniqueId).toEqual(referenceId);
    });

    it('should handle custom referenceId if cache is turned off', async () => {
      disableCache();
      const referenceId = 'custom-reference-id';
      client.http.post = jest.fn().mockResolvedValue({ data: { messages: [rawMessageToCreate] } });

      runQuery(createQuery(createMessage, { ...bundle, referenceId }));
      await pause();

      expect(client.http.post).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ referenceId }),
      );
    });
  });
});
