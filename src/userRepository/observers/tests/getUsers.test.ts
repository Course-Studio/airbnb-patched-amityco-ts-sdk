import { getPastDate } from '~/core/model';
import { disableCache, enableCache } from '~/cache/api';
import {
  client,
  connectClient,
  disconnectClient,
  pause,
  user11,
  user12,
  userQueryResponse,
  userQueryResponsePage2,
} from '~/utils/tests';

// makes it easier to spy on applyFilter
import * as getUsersModule from '../getUsers';

const { getUsers } = getUsersModule;

const getSnapshot = (params?: Record<string, any>) => {
  return {
    data: [] as Amity.InternalUser[],
    loading: true,
    error: undefined as any,
    ...params,
  };
};

const { paging, ...payload } = userQueryResponse.data;
const { paging: paging2, ...payload2 } = userQueryResponsePage2.data;

describe('getUsers', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  beforeEach(enableCache);

  afterEach(disableCache);

  const params = { sortBy: 'lastCreated' } as Amity.UserLiveCollection;

  // integration_test_id: c7cb9776-5c72-4abe-9b3c-572d74d534fe
  test('it should return users collection', async () => {
    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(userQueryResponse);

    getUsers(params, callback);
    await pause();

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(1, expect.objectContaining(getSnapshot()));
    expect(callback).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining(
        getSnapshot({
          data: payload.users,
          loading: false,
        }),
      ),
    );
  });

  test.skip('it should return data from cache', async () => {
    /**
     * skip this unit test because the behaviour is changed.
     * when calling getUsers(), it will create a new instance of the user collection.
     */
    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(userQueryResponse);

    getUsers(params, () => undefined);
    await pause();
    getUsers(params, callback);
    await pause();

    // The second `getUsers` call fetches data from the cache,
    // so there is no loading state and the callback only fires once.
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining(
        getSnapshot({
          data: payload.users,
          loading: false,
        }),
      ),
    );
  });

  test('it should return method to fetch next page', async () => {
    const callback = jest.fn();
    client.http.get = jest
      .fn()
      .mockResolvedValue(userQueryResponse)
      .mockResolvedValueOnce(userQueryResponsePage2);

    getUsers(params, callback);
    await pause();

    expect(callback).toHaveBeenCalled();
    expect(callback.mock.lastCall).toHaveLength(1);

    const { onNextPage, hasNextPage } = callback.mock.lastCall[0];

    expect(hasNextPage).toBe(true);
    expect(onNextPage).toBeTruthy();

    onNextPage();
    await pause();

    // 4 -> because 1 local & server call each per call (2)
    expect(callback).toHaveBeenCalledTimes(4);
    expect(callback).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining(
        getSnapshot({
          loading: false,
          data: [...payload2.users, ...payload.users],
        }),
      ),
    );
  });

  describe('events', () => {
    // integration_test_id: 60b4b354-efca-49bc-aa8b-d63a8da6ef31
    const updatedUser = { ...user11, displayName: 'updated-user' };
    const flaggedUser = { ...user11, flagCount: 1 };
    const unflaggedUser = { ...user11, flagCount: 1 };
    const flagClearedUser = { ...user11, flagCount: 0 };

    const cases: [string, keyof Amity.Events, Amity.UserPayload, Amity.InternalUser[]][] = [
      [
        'it should update user in collection onUpdate',
        'user.updated',
        { users: [updatedUser], files: [] },
        [updatedUser, user12],
      ],
      [
        'it should update user in collection onUpdate',
        'user.flagged',
        { users: [flaggedUser], files: [] },
        [flaggedUser, user12],
      ],
      [
        'it should update user in collection onUpdate',
        'user.unflagged',
        { users: [unflaggedUser], files: [] },
        [unflaggedUser, user12],
      ],
      [
        'it should update user in collection onUpdate',
        'user.flagCleared',
        { users: [flagClearedUser], files: [] },
        [flagClearedUser, user12],
      ],
    ];

    test.each(cases)('%s', async (test, event, user, expected) => {
      const callback = jest.fn();
      client.http.get = jest.fn().mockResolvedValue(userQueryResponse);

      getUsers(params, callback);
      await pause();

      client.emitter.emit(event, user);
      await pause();

      expect(callback).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining(
          getSnapshot({
            data: expected,
            loading: false,
          }),
        ),
      );
    });
  });
});
