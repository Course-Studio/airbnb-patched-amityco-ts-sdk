import { ASCApiError } from '~/core/errors';
import { sessionResponse, user11, disconnectClient } from '~/utils/tests';
import { login, createClient } from '..';
import { setActiveClient } from '../activeClient';

let client: Amity.Client;

const sessionHandler: Amity.SessionHandler = {
  sessionWillRenewAccessToken(_) {
    // do nothing
  },
};

const onConnect = () =>
  setTimeout(() => {
    const CONNECT_PACKET = { type: 0, nsp: client.ws.nsp };

    client.ws.emit('connect');

    // simulate a connection ack packet from server
    client.ws.io.emit('packet', CONNECT_PACKET);
  }, 50);

describe('login', () => {
  beforeEach(() => {
    client = createClient('key', 'sg');
    client.mqtt.connect = jest.fn();
    client.mqtt.subscribe = jest.fn();
    client.http.post = jest.fn().mockResolvedValueOnce(sessionResponse);

    setActiveClient(client);
  });

  afterEach(async () => {
    if (client.sessionState === Amity.SessionStates.ESTABLISHED) await disconnectClient();
  });

  test('it should connect client', async () => {
    onConnect().unref();

    const recieved = await login({ userId: user11.userId }, sessionHandler);

    expect(recieved).toBe(true);
  });

  test('it should establish connection', async () => {
    onConnect().unref();

    await login({ userId: user11.userId }, sessionHandler);
    const { sessionState } = client;

    expect(sessionState).toBe(Amity.SessionStates.ESTABLISHED);
  });

  test('it should have session state establishing while connecting client', () => {
    login({ userId: user11.userId }, sessionHandler);

    expect(client.sessionState).toBe(Amity.SessionStates.ESTABLISHING);
  });

  test('it should have session state notLoggedIn on failure', async () => {
    client.http.post = jest
      .fn()
      .mockRejectedValue(
        new ASCApiError('unauthorzed', Amity.ServerError.UNAUTHORIZED, Amity.ErrorLevel.FATAL),
      );

    await expect(login({ userId: user11.userId }, sessionHandler)).rejects.toThrow('unauthorzed');
    expect(client.sessionState).toBe(Amity.SessionStates.NOT_LOGGED_IN);
  });

  test('it should terminate session on ban', async () => {
    onConnect().unref();

    await login({ userId: user11.userId }, sessionHandler);

    // ban user
    client.emitter.emit('user.didGlobalBan', {} as Amity.UserPayload);

    expect(client.sessionState).toBe(Amity.SessionStates.TERMINATED);
  });
});
