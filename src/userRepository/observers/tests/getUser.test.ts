import { disableCache, enableCache } from '~/cache/api';
import {
  client,
  connectClient,
  disconnectClient,
  pause,
  user11 as defaultUser,
  userQueryResponse,
} from '~/utils/tests';
import { getFutureDate } from '~/core/model';
import { getUser } from '../getUser';

const getSnapshot = () => {
  return {
    loading: true,
    error: undefined as any,
    data: undefined as undefined | Amity.User,
  };
};

describe('getUser', () => {
  beforeAll(async () => {
    await connectClient();
  });

  afterAll(async () => {
    await disconnectClient();
  });

  beforeEach(enableCache);

  afterEach(disableCache);

  const events: [string, keyof Amity.Events][] = [
    ['it should return updated user on onFetch', 'user.fetched'],
    ['it should return updated user on onUpdate', 'user.updated'],
    ['it should return updated user on onDelete', 'user.deleted'],
    ['it should return updated user on onFlagged', 'user.flagged'],
    ['it should return updated user on onUnflagged', 'user.unflagged'],
    ['it should return updated user on onFlagCleared', 'user.flagCleared'],
  ];

  test.each(events)('%s', async (test, event) => {
    const snapshot = getSnapshot();

    // mock response of queryUsers and validate
    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(userQueryResponse);

    getUser(defaultUser.userId, callback);

    await pause();

    expect(callback).toHaveBeenCalledTimes(2);

    const updatedUser = {
      ...defaultUser,
      updatedAt: getFutureDate(defaultUser.updatedAt),
    };
    client.emitter.emit(event, { users: [updatedUser], files: [] });

    delete snapshot.error;
    snapshot.loading = false;
    snapshot.data = updatedUser;
    expect(callback).toHaveBeenNthCalledWith(3, expect.objectContaining(snapshot));
  });
});
