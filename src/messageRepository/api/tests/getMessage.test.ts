import { disableCache, enableCache, pullFromCache, pushToCache } from '~/cache/api';
import { isInTombstone } from '~/cache/api/isInTombstone';
import { pushToTombstone } from '~/cache/api/pushToTombstone';
import { ASCApiError } from '~/core/errors';
import { client, convertRawMessage, generateRawMessage } from '~/utils/tests';

import { getMessage } from '../getMessage';
import { onMessageFetched } from '../../events/onMessageFetched';
import * as getMessageMarkers from '../../../marker/api/getMessageMarkers';

const rawMessageToGet = generateRawMessage();
const messageToGet = convertRawMessage(rawMessageToGet);
const { messageId } = messageToGet;

const getResolvedMessageValue = () => ({
  data: {
    messages: [rawMessageToGet],
    users: [],
    files: [],
  },
});

describe('getMessage', () => {
  beforeAll(() => {
    jest.spyOn(getMessageMarkers, 'getMessageMarkers').mockImplementation(() =>
      Promise.resolve({
        data: [],
        cachedAt: undefined,
      }),
    );
  });

  // integration_test_id: bc048747-17ea-43fe-9f97-7b2bf008c476
  test('should return fetched message', async () => {
    client.http.get = jest.fn().mockResolvedValueOnce(getResolvedMessageValue());

    await expect(getMessage(messageId)).resolves.toEqual(
      expect.objectContaining({ data: messageToGet }),
    );
  });

  test('should update cache after fetching message', async () => {
    enableCache();
    client.http.get = jest.fn().mockResolvedValue(getResolvedMessageValue());

    await getMessage(messageId);
    const recieved = pullFromCache(['message', 'get', messageId])?.data;

    expect(recieved).toEqual(messageToGet);

    disableCache();
  });

  // integration_test_id: 81375153-2886-46e0-a164-7f3902e77b55
  test('should return 400300 if unauthorized', async () => {
    client.http.get = jest
      .fn()
      .mockRejectedValueOnce(
        new ASCApiError('forbidden', Amity.ServerError.FORBIDDEN, Amity.ErrorLevel.ERROR),
      );

    await expect(getMessage(messageId)).rejects.toThrow('400300');
  });

  test('should fire event `onMessageFetched`', async () => {
    let dispose;
    client.http.get = jest.fn().mockResolvedValueOnce(getResolvedMessageValue());

    const callbackPromise = new Promise(resolve => {
      dispose = onMessageFetched(resolve);
    }).finally(dispose);

    await getMessage(messageId);

    await expect(callbackPromise).resolves.toEqual(messageToGet);
  });
});

describe('getMessage tombostone', () => {
  beforeEach(() => enableCache());
  afterEach(() => disableCache());

  test('should add message to tombostone if 404', async () => {
    expect.assertions(2);

    client.http.get = jest
      .fn()
      .mockRejectedValueOnce(
        new ASCApiError('not found!', Amity.ServerError.ITEM_NOT_FOUND, Amity.ErrorLevel.ERROR),
      );

    await expect(getMessage(messageId)).rejects.toThrow();

    expect(() => isInTombstone('message', messageId)).toThrow();
  });

  test('should throw error if message not found in tombostone', async () => {
    pushToTombstone('message', messageId);

    await expect(getMessage(messageId)).rejects.toThrow();
  });
});

describe('getMessage.locally', () => {
  beforeEach(() => enableCache());
  afterEach(() => disableCache());

  test('should return cached message', () => {
    pushToCache(['message', 'get', messageId], messageToGet);

    expect(getMessage.locally(messageId)?.data).toBe(messageToGet);
  });

  test('it should return undefined if message not in cache', () => {
    expect(getMessage.locally('non-existent-message')).toBeUndefined();
  });

  test('should return undefined if cache not enabled', () => {
    disableCache();
    pushToCache(['message', 'get', messageId], messageToGet);

    expect(getMessage.locally(messageId)).toBeUndefined();
  });

  test('should return undefined if 404', async () => {
    expect.assertions(2);
    pushToCache(['message', 'get', messageId], messageToGet);

    client.http.get = jest
      .fn()
      .mockRejectedValueOnce(
        new ASCApiError('not found!', Amity.ServerError.ITEM_NOT_FOUND, Amity.ErrorLevel.ERROR),
      );

    await expect(getMessage(messageId)).rejects.toThrow();
    expect(getMessage.locally(messageId)).toBeUndefined();
  });
});
