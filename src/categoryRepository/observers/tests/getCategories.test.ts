import { disableCache, enableCache } from '~/cache/api';
import {
  client,
  connectClient,
  disconnectClient,
  pause,
  categoryQueryResponse,
  categoryQueryResponsePage2,
  category11,
  category12,
} from '~/utils/tests';
import { sortByName } from '~/core/query';

import { getCategories } from '../getCategories';
import { LinkedObject } from '~/utils/linkedObject';

const getSnapshot = (params?: Record<string, any>) => {
  return {
    data: [] as Amity.Category[],
    loading: true,
    error: undefined as any,
    ...params,
  };
};

const params = { includeDeleted: true };

describe('getCategories', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  beforeEach(enableCache);

  afterEach(disableCache);

  const payload = categoryQueryResponse.data;
  const payloadPage2 = categoryQueryResponsePage2.data;

  test('it should return category collection', async () => {
    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(categoryQueryResponse);

    getCategories(params, callback);
    await pause();

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(1, expect.objectContaining(getSnapshot()));
    expect(callback).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining(
        getSnapshot({
          data: payload.categories.map(category => LinkedObject.category(category)),
          loading: false,
        }),
      ),
    );
  });

  test('it should return data from cache', async () => {
    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(categoryQueryResponse);

    getCategories(params, () => undefined);
    await pause();

    getCategories(params, callback);
    await pause();

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining(
        getSnapshot({
          data: payload.categories,
          loading: false,
        }),
      ),
    );
  });

  const filters: [string, Amity.CategoryLiveCollection, Amity.Category[]][] = [
    ['not deleted', { includeDeleted: false }, [category11, category12]],
  ];

  test.each(filters)('it should filter by %s categories', async (filter, params, expected) => {
    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(categoryQueryResponse);

    getCategories(params, callback);

    expect(callback).toHaveBeenCalledTimes(1);
    // check if cache data returned (should be empty)
    expect(callback).toHaveBeenCalledWith(expect.objectContaining(getSnapshot()));

    await pause();

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining(
        getSnapshot({
          loading: false,
          data: expected,
        }),
      ),
    );
  });

  test('it should return method to fetch next page', async () => {
    const callback = jest.fn();
    client.http.get = jest
      .fn()
      .mockResolvedValue(categoryQueryResponse)
      .mockResolvedValueOnce(categoryQueryResponsePage2);

    getCategories(params, callback);
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
          data: [...payloadPage2.categories, ...payload.categories].sort(sortByName),
        }),
      ),
    );
  });
});
