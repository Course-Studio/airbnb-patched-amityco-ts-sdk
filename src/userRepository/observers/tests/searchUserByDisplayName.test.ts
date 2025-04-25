import { disableCache, enableCache } from '~/cache/api';
import {
  client,
  connectClient,
  disconnectClient,
  pause,
  user21,
  userQueryResponse,
  userQueryResponsePage2,
} from '~/utils/tests';

import { searchUserByDisplayName } from '../searchUserByDisplayName';

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

describe('searchUserByDisplayName', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  beforeEach(enableCache);

  afterEach(disableCache);

  const params = { displayName: user21.displayName } as Amity.UserLiveCollection;

  // integration_test_id: c7cb9776-5c72-4abe-9b3c-572d74d534fe
  test('it should return users collection', async () => {
    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(userQueryResponse);

    searchUserByDisplayName(params, callback);
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

  test('it should return data from cache', async () => {
    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(userQueryResponse);

    searchUserByDisplayName(params, () => undefined);
    await pause();
    searchUserByDisplayName(params, callback);
    await pause();

    // The second `searchUserByDisplayName` call fetches data from the cache,
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

    searchUserByDisplayName(params, callback);
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
});
