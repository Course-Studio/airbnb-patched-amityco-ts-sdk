import { disableCache, enableCache, pullFromCache } from '~/cache/api';
import { client, connectClient, disconnectClient, generateRawMessage, user11 } from '~/utils/tests';
import { ASCApiError } from '~/core/errors';
import { fireEvent } from '~/core/events';

import { unflagMessage } from '..';
import { convertFromRaw } from '../../utils';

jest.mock('~/core/events', () => ({
  __esModule: true,
  ...jest.requireActual('~/core/events'),
  fireEvent: jest.fn(),
}));

const unflaggedRawMessage = generateRawMessage();
const message = convertFromRaw(unflaggedRawMessage);
const { messageId } = unflaggedRawMessage;

const unflaggedMessageQueryResponse = {
  data: {
    messages: [unflaggedRawMessage],
    users: [user11],
  },
};

describe('unflagMessage', () => {
  beforeEach(disableCache);
  beforeAll(connectClient);
  afterAll(disconnectClient);

  // integration_test_id: afb432ec-52eb-49d7-8054-c162e3b60535
  test('it should unflag message with messageId', async () => {
    const expected = true;
    client.http.delete = jest.fn().mockResolvedValue(unflaggedMessageQueryResponse);

    const received = await unflagMessage(messageId);

    expect(received).toBe(expected);
  });

  // integration_test_id: 5c6b5a0a-628d-4834-8453-d11df656dea8
  test('it should throw error with 400400 when sending invalid messageId', async () => {
    client.http.delete = jest
      .fn()
      .mockRejectedValueOnce(
        new ASCApiError('unauthorized', Amity.ServerError.ITEM_NOT_FOUND, Amity.ErrorLevel.ERROR),
      );

    await expect(unflagMessage(messageId)).rejects.toThrow('400400');
  });

  test('it should call fire event method', async () => {
    client.http.delete = jest.fn().mockResolvedValue(unflaggedMessageQueryResponse);

    const recieved = await unflagMessage(messageId);
    const [recievedMqttString] = (fireEvent as jest.Mock).mock.lastCall;

    expect(recieved).toBe(true);
    expect(recievedMqttString).toBe('message.unflagged');
  });

  test('it should call the appropriate api', async () => {
    const apimock = jest.fn();
    const expected = `/api/v5/messages/${encodeURIComponent('messageId')}/flags`;

    client.http.delete = apimock.mockResolvedValue({ data: {} });

    await unflagMessage('messageId');

    const received = apimock.mock.lastCall[0];

    expect(received).toBe(expected);
  });

  test('it should add data to cache', async () => {
    enableCache();
    const expected = message;
    client.http.delete = jest.fn().mockResolvedValue(unflaggedMessageQueryResponse);

    await unflagMessage(messageId);
    const recieved = pullFromCache(['message', 'get', messageId]);

    expect(recieved?.data).toStrictEqual(expected);

    disableCache();
  });
});
