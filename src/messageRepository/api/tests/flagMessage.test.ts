import { disableCache, enableCache, pullFromCache } from '~/cache/api';
import { client, connectClient, disconnectClient, generateRawMessage, user11 } from '~/utils/tests';
import { ASCApiError } from '~/core/errors';
import { fireEvent } from '~/core/events';

import { flagMessage } from '..';
import { convertFromRaw } from '../../utils';

jest.mock('~/core/events', () => ({
  __esModule: true,
  ...jest.requireActual('~/core/events'),
  fireEvent: jest.fn(),
}));

const flaggedRawMessage = generateRawMessage({ flagCount: 1 });
const message = convertFromRaw(flaggedRawMessage);
const { messageId } = flaggedRawMessage;

const flaggedMessageQueryResponse = {
  data: {
    messages: [flaggedRawMessage],
    users: [user11],
  },
};

describe('flagMessage', () => {
  beforeEach(disableCache);
  beforeAll(connectClient);
  afterAll(disconnectClient);

  // integration_test_id: fd507b43-99e7-4aed-816d-d51d357d303b
  test('it should flag message with messageId', async () => {
    const expected = true;
    client.http.post = jest.fn().mockResolvedValue(flaggedMessageQueryResponse);

    const received = await flagMessage(messageId);

    expect(received).toBe(expected);
  });

  // integration_test_id: 0c78c9fd-1d4e-4af7-ad6b-e76372addb2f
  test('it should throw error with 400400 when sending invalid messageId', async () => {
    client.http.post = jest
      .fn()
      .mockRejectedValueOnce(
        new ASCApiError('unauthorized', Amity.ServerError.ITEM_NOT_FOUND, Amity.ErrorLevel.ERROR),
      );

    await expect(flagMessage(messageId)).rejects.toThrow('400400');
  });

  test('it should call fire event method', async () => {
    client.http.post = jest.fn().mockResolvedValue(flaggedMessageQueryResponse);

    const recieved = await flagMessage(messageId);
    const [recievedMqttString] = (fireEvent as jest.Mock).mock.lastCall;

    expect(recieved).toBe(true);
    expect(recievedMqttString).toBe('message.flagged');
  });

  test('it should call the appropriate api', async () => {
    const apimock = jest.fn();
    const expected = `/api/v5/messages/${encodeURIComponent('messageId')}/flags`;

    client.http.post = apimock.mockResolvedValue({ data: {} });

    await flagMessage('messageId');

    const received = apimock.mock.lastCall[0];

    expect(received).toBe(expected);
  });

  test('it should add data to cache', async () => {
    enableCache();
    const expected = message;
    client.http.post = jest.fn().mockResolvedValue(flaggedMessageQueryResponse);

    await flagMessage(messageId);
    const recieved = pullFromCache(['message', 'get', messageId]);

    expect(recieved?.data).toStrictEqual(expected);

    disableCache();
  });
});
