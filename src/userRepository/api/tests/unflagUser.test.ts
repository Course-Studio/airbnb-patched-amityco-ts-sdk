import { disableCache, enableCache, pullFromCache } from '~/cache/api';
import {
  client,
  connectClient,
  disconnectClient,
  flaggedUser as unflaggedUser,
  flaggedUserQueryResponse as unflaggedUserQueryResponse,
} from '~/utils/tests';
import { ASCApiError } from '~/core/errors';
import { fireEvent } from '~/core/events';

import { unflagUser } from '..';

jest.mock('~/core/events', () => ({
  __esModule: true,
  ...jest.requireActual('~/core/events'),
  fireEvent: jest.fn(),
}));

describe('unflagUser', () => {
  beforeEach(disableCache);
  beforeAll(connectClient);
  afterAll(disconnectClient);

  // integration_test_id: fddf1d63-98e2-4296-ab3a-4e2b55044f89
  test('it should unflag user with userId', async () => {
    const expected = true;
    client.http.delete = jest.fn().mockResolvedValue(unflaggedUserQueryResponse);

    const received = await unflagUser(unflaggedUser.userId);

    expect(received).toBe(expected);
  });

  // integration_test_id: a95a0784-56ce-4b17-ac1b-0f1c50a361ef
  test('it should throw error with 400400 when sending invalid userId', async () => {
    client.http.delete = jest
      .fn()
      .mockRejectedValueOnce(
        new ASCApiError('unauthorized', Amity.ServerError.ITEM_NOT_FOUND, Amity.ErrorLevel.ERROR),
      );

    await expect(unflagUser(unflaggedUser.userId)).rejects.toThrow('400400');
  });

  test('it should fire event for user', async () => {
    client.http.delete = jest.fn().mockResolvedValue(unflaggedUserQueryResponse);

    const recieved = await unflagUser(unflaggedUser.userId);
    const [recievedMqttString] = (fireEvent as jest.Mock).mock.lastCall;

    expect(recieved).toBe(true);
    expect(recievedMqttString).toBe('user.unflagged');
  });

  test('it should call the appropriate api', async () => {
    const apimock = jest.fn();
    const expected = `/api/v4/me/flags/${encodeURIComponent('userId')}`;

    client.http.delete = apimock.mockResolvedValue({ data: {} });

    await unflagUser('userId');
    const received = apimock.mock.lastCall[0];

    expect(received).toBe(expected);
  });

  test('it should add data to cache', async () => {
    enableCache();
    const expected = unflaggedUser;
    client.http.delete = jest.fn().mockResolvedValue(unflaggedUserQueryResponse);

    await unflagUser(unflaggedUser.userId);
    const recieved = pullFromCache(['user', 'get', unflaggedUser.userId]);

    expect(recieved?.data).toBe(expected);

    disableCache();
  });
});
