import { pushToCache, pullFromCache, enableCache } from '~/cache/api';
import { client, connectClient, message11 as message } from '~/utils/tests';

import { logout } from '..';

const disconnect = () => setTimeout(() => client.ws.emit('disconnect'), 500);

describe('logout', () => {
  beforeEach(async () => {
    await connectClient();
  });

  test('it should disconnect client', async () => {
    disconnect().unref();

    const recieved = await logout();

    expect(recieved).toBe(true);
  });

  test('it should set sesion state to notLoggedIn after disconnect', async () => {
    disconnect().unref();
    await logout();

    expect(client.sessionState).toBe(Amity.SessionStates.NOT_LOGGED_IN);
  });

  test('it should not update sesion state if session state terminated', async () => {
    client.sessionState = Amity.SessionStates.TERMINATED;
    disconnect().unref();

    await logout();

    expect(client.sessionState).toBe(Amity.SessionStates.TERMINATED);
  });

  test('it should clear userId and accessToken on disconnect', async () => {
    disconnect().unref();

    await logout();

    expect(client.userId).toBeUndefined();
    expect(client.token).toBeUndefined();
  });

  test('it should clear auth header on disconnect', async () => {
    disconnect().unref();

    await logout();

    expect(client.http.defaults.headers.common.Authorization).toBeFalsy();
  });

  test('it should clear cache on disconnect', async () => {
    disconnect().unref();
    enableCache();

    const cacheKey = ['message', 'get', message.messageId];
    pushToCache(cacheKey, message);

    await logout();

    expect(pullFromCache(cacheKey)).toBeUndefined();
  });

  test('it should not clear cache if tokenExpired', async () => {
    client.sessionState = Amity.SessionStates.TOKEN_EXPIRED;
    disconnect().unref();
    enableCache();

    const cacheKey = ['message', 'get', message.messageId];
    pushToCache(cacheKey, message);

    await logout();

    expect(pullFromCache(cacheKey)?.data).toStrictEqual(message);
  });
});
