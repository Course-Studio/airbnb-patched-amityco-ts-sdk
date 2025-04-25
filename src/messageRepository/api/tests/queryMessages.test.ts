import { disableCache, enableCache, pullFromCache, pushToCache } from '~/cache/api';
import { client, convertRawMessage, generateRawMessage } from '~/utils/tests';

import { convertQueryParams } from '../../utils';
import { queryMessages } from '../queryMessages';
import { onMessageFetched } from '../../events/onMessageFetched';
import * as getMessageMarkers from '../../../marker/api/getMessageMarkers';

const rawMessagesToQuery = [
  generateRawMessage(),
  generateRawMessage({ messageId: 'message-id-2' }),
];

const messagesToQuery = rawMessagesToQuery.map(convertRawMessage);
const messageIds = messagesToQuery.map(x => x.messageId);
const queryCriteriaWithoutPage = { subChannelId: messagesToQuery[0].subChannelId };
const queryCriteria = { ...queryCriteriaWithoutPage, page: { limit: 10 } };
const paging = {
  next: 'eyJsaW1pdCI6MiwiYmVmb3JlIjo2MzQ3MTYxNDM5MTExMTAwMDAwMH0',
};
const nextPage = { before: 63471614391111000000, limit: 2 };

const getResolvedMessageValue = () => ({
  data: {
    messages: rawMessagesToQuery,
    files: [],
    users: [],
    paging,
  },
});

describe('queryMessages', () => {
  beforeAll(() => {
    jest.spyOn(getMessageMarkers, 'getMessageMarkers').mockImplementation(() =>
      Promise.resolve({
        data: [],
        cachedAt: undefined,
      }),
    );
  });

  test('should return fetched messages with correct paging', async () => {
    client.http.get = jest.fn().mockResolvedValueOnce(getResolvedMessageValue());

    await expect(queryMessages(queryCriteria)).resolves.toEqual(
      expect.objectContaining({
        data: messagesToQuery,
        nextPage,
        prevPage: undefined,
      }),
    );
  });

  test('should update cache after fetching messages', async () => {
    enableCache();
    client.http.get = jest.fn().mockResolvedValue(getResolvedMessageValue());

    await queryMessages(queryCriteria);

    const recieved = pullFromCache(['message', 'query', convertQueryParams(queryCriteria)])?.data;

    expect(recieved).toEqual({
      messages: messageIds,
      paging,
    });

    disableCache();
  });

  test('should throw an error if request fails', async () => {
    client.http.get = jest.fn().mockRejectedValueOnce(new Error('error'));

    await expect(queryMessages(queryCriteria)).rejects.toThrow('error');
  });

  test('should fire event `onMessageFetched`', async () => {
    let dispose;

    client.http.get = jest.fn().mockResolvedValueOnce(getResolvedMessageValue());

    const callbackPromise = new Promise(resolve => {
      dispose = onMessageFetched(resolve);
    }).finally(dispose);

    await queryMessages(queryCriteria);
    await expect(callbackPromise).resolves.toEqual(messagesToQuery[0]);
  });

  test('it should set isDeleted to undefined if includeDeleted is true', async () => {
    const mockFn = jest.fn();
    client.http.get = mockFn.mockResolvedValue(getResolvedMessageValue());

    await queryMessages({ ...queryCriteriaWithoutPage, includeDeleted: true });

    expect(mockFn.mock.lastCall).toHaveLength(2);
    expect(mockFn.mock.lastCall[1].params.isDeleted).toBeUndefined();
  });

  test('it should set isDeleted to false if includeDeleted is false', async () => {
    const mockFn = jest.fn();
    client.http.get = mockFn.mockResolvedValue(getResolvedMessageValue());

    await queryMessages({ ...queryCriteriaWithoutPage, includeDeleted: false });

    expect(mockFn.mock.lastCall).toHaveLength(2);
    expect(mockFn.mock.lastCall[1].params.isDeleted).toBe(false);
  });

  test('it should set isDeleted to false if includeDeleted is undefined', async () => {
    const mockFn = jest.fn();
    client.http.get = mockFn.mockResolvedValue(getResolvedMessageValue());

    await queryMessages(queryCriteriaWithoutPage);

    expect(mockFn.mock.lastCall).toHaveLength(2);
    expect(mockFn.mock.lastCall[1].params.isDeleted).toBe(false);
  });
});
