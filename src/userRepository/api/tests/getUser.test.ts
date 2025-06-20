import { ASCApiError } from '~/core/errors';
import { disableCache, enableCache, pushToCache } from '~/cache/api';
import { client, user11 } from '~/utils/tests';

import { pushToTombstone } from '~/cache/api/pushToTombstone';
import { isInTombstone } from '~/cache/api/isInTombstone';

import { getUser } from '../getUser';

const user = user11;
const getResolvedUserValue = () => ({
  data: {
    users: [user],
    files: [],
  },
});

describe('getUser', () => {
  // integration_test_id: c9d28b37-c761-4df5-ac86-060a506f3007
  test('should return user data', async () => {
    client.http.get = jest.fn().mockResolvedValue(getResolvedUserValue());

    const { data } = await getUser(user.userId);

    expect(data).toStrictEqual(user);
  });

  test('it should update cache after fetch from server', async () => {
    enableCache();
    client.http.get = jest.fn().mockResolvedValue(getResolvedUserValue());
    await getUser(user.userId);

    expect(getUser.locally(user.userId)).toBeDefined();

    disableCache();
  });

  // integration_test_id: b5204e28-7e11-44ff-b391-48181f1822ba
  test('should return an error', async () => {
    const expected = new ASCApiError(
      'User not found',
      Amity.ServerError.ITEM_NOT_FOUND,
      Amity.ErrorLevel.ERROR,
    );

    client.http.get = jest.fn().mockRejectedValue({
      data: expected,
    });

    try {
      await getUser(user.userId);
    } catch ({ data = null }) {
      expect(data).toEqual(expected);
    }
  });

  test('should return an error if user in cache but api throws not found', async () => {
    enableCache();
    pushToCache(['user', 'get', user.userId], user, { cachedAt: Date.now() });

    client.http.get = jest

      .fn()
      .mockRejectedValueOnce(
        new ASCApiError('not found!', Amity.ServerError.ITEM_NOT_FOUND, Amity.ErrorLevel.ERROR),
      );

    await expect(getUser(user.userId)).rejects.toThrow();

    expect(getUser.locally(user.userId)).toBeUndefined();
    disableCache();
  });
});

describe('getUser locally', () => {
  test('should return data from cache', () => {
    enableCache();

    const cachedAt = Date.now();

    pushToCache(['user', 'get', user.userId], user, { cachedAt });

    const data = getUser.locally(user.userId);

    expect(data).toBeDefined();
    expect(data?.data).toEqual(user);
    expect(data?.cachedAt).toEqual(cachedAt);

    disableCache();
  });

  test('should return undefined if user not in cache', () => {
    expect(getUser.locally('non-existent-user')).toBeUndefined();
  });

  test('should return undefined if cache not enabled', () => {
    expect(getUser.locally(user.userId)).toBeUndefined();
  });
});

describe('getUser tombostone', () => {
  test('it should add user to tombostone if 404', async () => {
    enableCache();
    client.http.get = jest
      .fn()
      .mockRejectedValueOnce(
        new ASCApiError('not found!', Amity.ServerError.ITEM_NOT_FOUND, Amity.ErrorLevel.ERROR),
      );

    await expect(getUser(user.userId)).rejects.toThrow();
    expect(() => {
      isInTombstone('user', user.userId);
    }).toThrow();

    disableCache();
  });

  test('it should throw error if user not found in tombostone', async () => {
    enableCache();

    pushToTombstone('user', user.userId);
    await expect(getUser(user.userId)).rejects.toThrow();

    disableCache();
  });
});
