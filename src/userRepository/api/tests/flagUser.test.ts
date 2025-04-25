import { disableCache, enableCache, pullFromCache } from '~/cache/api';
import {
  client,
  connectClient,
  disconnectClient,
  flaggedUser,
  flaggedUserQueryResponse,
} from '~/utils/tests';
import { ASCApiError } from '~/core/errors';
import { fireEvent } from '~/core/events';

import { flagUser } from '..';

jest.mock('~/core/events', () => ({
  __esModule: true,
  ...jest.requireActual('~/core/events'),
  fireEvent: jest.fn(),
}));

describe('flagUser', () => {
  beforeEach(disableCache);
  beforeAll(connectClient);
  afterAll(disconnectClient);

  // integration_test_id: ca4a760f-4342-4a99-9f3c-6c17cd205ca6
  test('it should flag user with userId', async () => {
    const expected = true;
    client.http.post = jest.fn().mockResolvedValue(flaggedUserQueryResponse);

    const received = await flagUser(flaggedUser.userId);

    expect(received).toBe(expected);
  });

  // integration_test_id: e8d0f02c-3558-488f-bdae-e70835d8cefb
  test('it should throw error with 400400 when sending invalid userId', async () => {
    client.http.post = jest
      .fn()
      .mockRejectedValueOnce(
        new ASCApiError('unauthorized', Amity.ServerError.ITEM_NOT_FOUND, Amity.ErrorLevel.ERROR),
      );

    await expect(flagUser(flaggedUser.userId)).rejects.toThrow('400400');
  });

  test('it should call fire event method', async () => {
    client.http.post = jest.fn().mockResolvedValue(flaggedUserQueryResponse);

    const recieved = await flagUser(flaggedUser.userId);
    const [recievedMqttString] = (fireEvent as jest.Mock).mock.lastCall;

    expect(recieved).toBe(true);
    expect(recievedMqttString).toBe('user.flagged');
  });

  test('it should call the appropriate api', async () => {
    const apimock = jest.fn();
    const expected = `api/v4/me/flags/${encodeURIComponent('userId')}`;

    client.http.post = apimock.mockResolvedValue({ data: {} });

    await flagUser('userId');

    const received = apimock.mock.lastCall[0];

    expect(received).toBe(expected);
  });

  test('it should add data to cache', async () => {
    enableCache();
    const expected = flaggedUser;
    client.http.post = jest.fn().mockResolvedValue(flaggedUserQueryResponse);

    await flagUser(flaggedUser.userId);
    const recieved = pullFromCache(['user', 'get', flaggedUser.userId]);

    expect(recieved?.data).toBe(expected);

    disableCache();
  });
});
