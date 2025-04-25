import { ASCApiError } from '~/core/errors';
import { disableCache, enableCache, pullFromCache, pushToCache } from '~/cache/api';
import { client, generateRawMessage } from '~/utils/tests';

import { editMessage } from '../editMessage';
import { onMessageUpdated } from '../../events';
import { convertFromRaw } from '../../utils';

const rawMessageToUpdate = generateRawMessage();
const messageToUpdate = convertFromRaw(rawMessageToUpdate);
const { messageId } = messageToUpdate;
const patch = { data: { text: 'hello world' } };
const rawUpdatedMessage = { ...rawMessageToUpdate, ...patch };
const updatedMessage = convertFromRaw(rawUpdatedMessage);

const getResolvedMessageValue = () => ({
  data: {
    messages: [rawUpdatedMessage],
    users: [],
    files: [],
  },
});

describe('editMessage', () => {
  // integration_test_id: 3ae17ea2-dee5-4418-88af-fe809ee48a52
  test('should return updated message', async () => {
    client.http.put = jest.fn().mockResolvedValueOnce(getResolvedMessageValue());

    const recieved = editMessage(messageId, patch);

    await expect(recieved).resolves.toEqual(expect.objectContaining({ data: updatedMessage }));
  });

  // integration_test_id: 3ae17ea2-dee5-4418-88af-fe809ee48a52
  test('should throw an error if request fails', async () => {
    client.http.put = jest
      .fn()
      .mockRejectedValueOnce(
        new ASCApiError('not found', Amity.ServerError.ITEM_NOT_FOUND, Amity.ErrorLevel.ERROR),
      );

    await expect(editMessage(messageId, patch)).rejects.toThrow('400400');
  });

  test('should update cache after updated messages', async () => {
    enableCache();
    client.http.put = jest.fn().mockResolvedValueOnce(getResolvedMessageValue());

    await editMessage(messageId, patch);
    const recieved = pullFromCache<Amity.Message>(['message', 'get', messageId])?.data;

    expect(recieved).toEqual(expect.objectContaining(patch));

    disableCache();
  });

  test('should fire event `onMessageUpdated`', async () => {
    let dispose;
    client.http.put = jest.fn().mockResolvedValueOnce(getResolvedMessageValue());

    const callbackPromise = new Promise(resolve => {
      dispose = onMessageUpdated(resolve);
    }).finally(dispose);

    await editMessage(messageId, patch);

    await expect(callbackPromise).resolves.toEqual(expect.objectContaining(updatedMessage));
  });
});

describe('editMessage.optimistically', () => {
  beforeEach(() => enableCache());
  afterEach(() => disableCache());

  test('should update cache after updated message', () => {
    pushToCache(['message', 'get', messageId], messageToUpdate);

    editMessage.optimistically(messageId, patch);
    const recieved = pullFromCache<Amity.Message>(['message', 'get', messageId])?.data;

    expect(recieved).toEqual(expect.objectContaining(patch));
  });

  test('should fire event `onMessageUpdated`', async () => {
    let dispose;

    const callbackPromise = new Promise(resolve => {
      dispose = onMessageUpdated(data => {
        resolve(data);
      });
    }).finally(dispose);

    editMessage.optimistically(messageId, patch);

    await expect(callbackPromise).resolves.toEqual(
      expect.objectContaining({
        ...updatedMessage,
        updatedAt: expect.anything(),
      }),
    );
  });

  test('should define object as unsynced object', () => {
    pushToCache(['message', 'get', messageId], messageToUpdate);

    expect(editMessage.optimistically(messageId, patch)?.cachedAt).toBe(-1);
  });
});
