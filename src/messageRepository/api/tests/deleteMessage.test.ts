import { ASCApiError } from '~/core/errors';
import { disableCache, enableCache, pullFromCache, pushToCache } from '~/cache/api';
import { client, generateRawMessage } from '~/utils/tests';

import { softDeleteMessage } from '../softDeleteMessage';
import { onMessageDeleted } from '../../events';
import { convertFromRaw } from '../../utils';

const rawMessageToDelete = generateRawMessage();
const messageToDelete = convertFromRaw(rawMessageToDelete);
const { messageId: deleteId } = messageToDelete;
const rawDeletedMessage = { ...rawMessageToDelete, isDeleted: true };
const deletedMessage = convertFromRaw(rawDeletedMessage);

const getResolvedMessageValue = () => ({
  data: {
    messages: [rawDeletedMessage],
    users: [],
    files: [],
  },
});

describe('softDeleteMessage', () => {
  // integration_test_id: 16106137-0e4a-4d2f-b8cf-1a6c571bf0c7
  test('should return deleted message', async () => {
    client.http.delete = jest.fn();
    client.http.get = jest.fn().mockResolvedValueOnce(getResolvedMessageValue());

    await expect(softDeleteMessage(deleteId)).resolves.toEqual(deletedMessage);
  });

  // integration_test_id: 27d393d9-480e-4eec-bfdb-f04738801b04
  test('should return 400400 if message not found', async () => {
    client.http.delete = jest
      .fn()
      .mockRejectedValueOnce(
        new ASCApiError('not found', Amity.ServerError.ITEM_NOT_FOUND, Amity.ErrorLevel.ERROR),
      );

    await expect(softDeleteMessage(deleteId)).rejects.toThrow('400400');
  });

  test('should update cache after deleted messages', async () => {
    enableCache();
    client.http.delete = jest.fn();
    client.http.get = jest.fn().mockResolvedValueOnce(getResolvedMessageValue());
    pushToCache(['message', 'get', deleteId], messageToDelete);

    await softDeleteMessage(deleteId);
    const recieved = pullFromCache<Amity.Message>(['message', 'get', deleteId])?.data;

    expect(recieved).toEqual(deletedMessage);

    disableCache();
  });

  test('should fire event `onMessageDeleted`', async () => {
    let dispose;
    client.http.delete = jest.fn();
    client.http.get = jest.fn().mockResolvedValueOnce(getResolvedMessageValue());

    const callbackPromise = new Promise(resolve => {
      dispose = onMessageDeleted(resolve);
    }).finally(dispose);

    await softDeleteMessage(deleteId);

    await expect(callbackPromise).resolves.toEqual(deletedMessage);
  });
});

describe('softDeleteMessage.optimistically', () => {
  beforeEach(() => enableCache());
  afterEach(() => disableCache());

  test('should update `isDeleted` in cache after deleted message', () => {
    pushToCache(['message', 'get', deleteId], messageToDelete);

    softDeleteMessage.optimistically(deleteId);
    const recieved = pullFromCache<Amity.Message>(['message', 'get', deleteId])?.data;

    expect(recieved).toEqual({
      ...deletedMessage,
      updatedAt: expect.anything(),
    });
  });

  /* TODO: re-enable this after fixed channel message count calculation */
  test.skip('should decrease message count after deleted message', () => {
    const { channelId } = messageToDelete;
    pushToCache(['channel', 'get', channelId], { channelId, messageCount: 2 });
    pushToCache(['message', 'get', deleteId], { ...messageToDelete, channelId });

    softDeleteMessage.optimistically(deleteId);
    const recieved = pullFromCache<Amity.StaticInternalChannel>([
      'channel',
      'get',
      channelId,
    ])?.data;

    expect(recieved?.messageCount).toBe(1);
  });

  test('should fire event `onMessageDeleted`', async () => {
    pushToCache(['message', 'get', deleteId], messageToDelete);
    let dispose;

    const callbackPromise = new Promise(resolve => {
      dispose = onMessageDeleted(data => {
        resolve(data);
      });
    }).finally(dispose);

    softDeleteMessage.optimistically(deleteId);

    await expect(callbackPromise).resolves.toEqual({
      ...deletedMessage,
      updatedAt: expect.anything(),
    });
  });

  test('should define object as unsynced object', () => {
    pushToCache(['message', 'get', deleteId], messageToDelete);

    expect(softDeleteMessage.optimistically(deleteId)?.cachedAt).toBe(-1);
  });
});
