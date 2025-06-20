import { disableCache, enableCache, pullFromCache, pushToCache } from '~/cache/api';
import { ASCApiError } from '~/core/errors';
import { client, convertRawMessage, generateRawMessage } from '~/utils/tests';

import { getMessages } from '../getMessages';
import { onMessageFetched } from '../../events/onMessageFetched';
import * as getMessageMarkers from '../../../marker/api/getMessageMarkers';

const rawMessagesToGet = [generateRawMessage(), generateRawMessage({ messageId: 'message-id-2' })];
const messagesToGet = rawMessagesToGet.map(convertRawMessage);
const messageIds = messagesToGet.map(x => x.messageId);

const getResolvedMessageValue = () => ({
  data: {
    messages: rawMessagesToGet,
    users: [],
    files: [],
  },
});

describe('getMessages', () => {
  beforeAll(() => {
    jest.spyOn(getMessageMarkers, 'getMessageMarkers').mockImplementation(() =>
      Promise.resolve({
        data: [],
        cachedAt: undefined,
      }),
    );
  });

  test('should return fetched messages', async () => {
    client.http.get = jest.fn().mockResolvedValueOnce(getResolvedMessageValue());

    await expect(getMessages(messageIds)).resolves.toEqual(
      expect.objectContaining({ data: messagesToGet }),
    );
  });

  test('should update cache after fetching messages', async () => {
    enableCache();
    client.http.get = jest.fn().mockResolvedValue(getResolvedMessageValue());

    await getMessages(messageIds);

    const recieved = messageIds.map(
      messageId => pullFromCache(['message', 'get', messageId])?.data,
    );

    expect(recieved).toEqual(messagesToGet);

    disableCache();
  });

  test('should throw an error if request fails', async () => {
    client.http.get = jest.fn().mockRejectedValueOnce(new Error('error'));

    await expect(getMessages(messageIds)).rejects.toThrow('error');
  });

  test('should fire event `onMessageFetched`', async () => {
    let dispose;
    client.http.get = jest.fn().mockResolvedValueOnce(getResolvedMessageValue());

    const callbackPromise = new Promise(resolve => {
      dispose = onMessageFetched(resolve);
    }).finally(dispose);

    await getMessages(messageIds);
    await expect(callbackPromise).resolves.toEqual(messagesToGet[0]);
  });
});

describe('getMessages tombostone', () => {
  test.todo('should add messages to tombostone if 404');
  test.todo('should throw error if messages not found in tombostone');
});

describe('getMessages.locally', () => {
  beforeEach(enableCache);
  afterEach(enableCache);

  test('should return cached messages', () => {
    messagesToGet.forEach(message => pushToCache(['message', 'get', message.messageId], message));

    expect(getMessages.locally(messageIds)?.data).toEqual(messagesToGet);
  });

  test('it should return undefined if message not in cache', () => {
    expect(getMessages.locally(['non-existent-message'])).toBeUndefined();
  });

  test('should return undefined if cache not enabled', () => {
    disableCache();
    messagesToGet.forEach(message => pushToCache(['message', 'get', message.messageId], message));

    expect(getMessages.locally(messageIds)).toBeUndefined();
  });

  /* TODO: re-enable this once tombstone has been implemented */
  test.skip('should return undefined if 404', async () => {
    expect.assertions(2);

    const error = new ASCApiError(
      'not found!',
      Amity.ServerError.ITEM_NOT_FOUND,
      Amity.ErrorLevel.ERROR,
    );

    client.http.get = jest.fn().mockRejectedValueOnce(error);
    messagesToGet.forEach(message => pushToCache(['message', 'get', message.messageId], message));

    await expect(getMessages(messageIds)).rejects.toThrow();

    expect(getMessages.locally(messageIds)).toBeUndefined();
  });
});
