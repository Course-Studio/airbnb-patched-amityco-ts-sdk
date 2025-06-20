import { ACCESS_TOKEN_WATCHER_INTERVAL } from '~/utils/constants';
import { client, connectClient, disconnectClient, user11, pause } from '~/utils/tests';

import { renewal } from '../renewal';

const accessToken = 'renewed-access-token';
const sessionResponse = {
  data: {
    accessToken,
    issuedAt: new Date(),
    expiresAt: new Date(),
    users: [user11],
    files: [],
  },
};

describe('renewal', () => {
  beforeAll(connectClient);

  afterAll(disconnectClient);

  test('it should renew access token', async () => {
    const mock = jest.fn();
    client.http.post = mock.mockResolvedValue(sessionResponse);

    renewal().renew();
    await pause();

    expect(client.token?.accessToken).toBe(accessToken);
  });

  test('it should show warning message if renewal already called', async () => {
    client.http.post = jest.fn().mockResolvedValue(sessionResponse);
    jest.spyOn(global.console, 'log');

    const expected = "'renew' method can be called only once per renewal instance";
    const renewalInstance = renewal();

    renewalInstance.renew();
    await pause();

    renewalInstance.renew();
    await pause();

    expect(console.log).toBeCalledWith(expected);
  });

  test('it should call renewal later if unable to renew', async () => {
    jest.useFakeTimers();
    const sessionHandler: Amity.SessionHandler = {
      sessionWillRenewAccessToken(renewal) {
        renewal.renew();
      },
    };

    client.sessionHandler = sessionHandler;

    const mock = jest.fn();
    client.http.post = mock.mockResolvedValue(sessionResponse);

    renewal().unableToRetrieveAuthToken();
    jest.advanceTimersByTime(ACCESS_TOKEN_WATCHER_INTERVAL);

    expect(mock).toBeCalled();
  });
});
