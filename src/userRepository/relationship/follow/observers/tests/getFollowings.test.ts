import { ASCApiError } from '~/core/errors';
import { disableCache, enableCache } from '~/cache/api';
import { ENABLE_CACHE_MESSAGE } from '~/utils/constants';

import { queryFollowings } from '../../api/queryFollowings';
import { getFollowings } from '../getFollowings';

import {
  client,
  connectClient,
  disconnectClient,
  follows,
  encodeJson,
  follow11,
} from '~/utils/tests';

const getSnapshot = () => {
  return {
    loading: true,
    error: undefined as any,
    data: [] as Amity.FollowStatus[],
  };
};

describe('getFollowings', () => {
  beforeAll(async () => {
    await connectClient();
  });

  afterAll(async () => {
    await disconnectClient();
  });

  beforeEach(enableCache);

  afterEach(disableCache);

  const { userId } = follows;
  const args: Amity.FollowingLiveCollection = { userId };

  test('it should show message if cache not enabled', () => {
    /*
     * NOTE: at the time of writing this test cache is diabled by default, but
     * there is a proposal to enable cache by default. So I'm disabling cache
     * here to ensure cache is disabled
     */
    disableCache();

    const callback = jest.fn();
    jest.spyOn(global.console, 'log');
    client.http.get = jest.fn();

    // call getFollowings check if mocked console get's called with the correct
    // message
    client.use();
    getFollowings(args, callback);

    expect(console.log).toBeCalledWith(ENABLE_CACHE_MESSAGE);
  });

  test('it should return following collection', async () => {
    const snapshot = getSnapshot();
    const response = { data: { paging: {}, follows: follows.page1 } };

    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(response);

    getFollowings(args, callback);

    expect(callback).toHaveBeenCalledTimes(1);

    expect(callback).toHaveBeenCalledWith(expect.objectContaining(snapshot));

    await expect(queryFollowings(args)).resolves.toBeTruthy();

    expect(callback).toHaveBeenCalledTimes(2);

    snapshot.loading = false;
    snapshot.data = response.data.follows;
    expect(callback).toHaveBeenCalledWith(expect.objectContaining(snapshot));
  });

  test('it should return error on api failure', async () => {
    const snapshot = getSnapshot();
    const error = new ASCApiError(
      'server error!',
      Amity.ServerError.ITEM_NOT_FOUND,
      Amity.ErrorLevel.ERROR,
    );

    const callback = jest.fn();
    client.http.get = jest.fn().mockRejectedValue(error);

    getFollowings(args, callback);

    expect(callback).toHaveBeenCalledTimes(1);

    expect(callback).toHaveBeenCalledWith(expect.objectContaining(snapshot));

    await expect(queryFollowings(args)).rejects.toThrow();

    expect(callback).toHaveBeenCalledTimes(2);

    snapshot.error = error;
    snapshot.loading = false;
    expect(callback).toHaveBeenLastCalledWith(expect.objectContaining(snapshot));
  });

  const statusFilters: [string, Amity.FollowingLiveCollection][] = [
    ['all', { ...args, status: 'all', limit: 10 }],
    ['accepted', { ...args, status: 'accepted', limit: 10 }],
    ['pending', { ...args, status: 'pending', limit: 10 }],
  ];

  test.each(statusFilters)('it should filter %s follows based on param', async (filter, params) => {
    const snapshot = getSnapshot();
    const response = { data: { paging: {}, follows: follows.page1 } };

    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(response);

    getFollowings(params, callback);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.objectContaining(snapshot));

    // TODO : why ts gives no shit about args here ? wrong type :D
    const query = queryFollowings(params);

    await expect(query).resolves.toBeTruthy();

    expect(callback).toHaveBeenCalledTimes(2);

    snapshot.loading = false;
    snapshot.data =
      filter === 'all'
        ? response.data.follows
        : response.data.follows.filter(fl => fl.status === filter);
    expect(callback).toHaveBeenCalledWith(expect.objectContaining(snapshot));
  });

  test('it should return method to fetch next page', async () => {
    const snapshot = getSnapshot();
    const args: Amity.FollowingLiveCollection = { userId, limit: 3 };
    const next = encodeJson({
      limit: 3,
      before: follows.page1[2].from,
      updatedAt: follows.page1[2].updatedAt,
    });

    const response = { data: { follows: follows.page2, paging: {} } };
    const responseWithNextPage = { data: { follows: follows.page1, paging: { next } } };

    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(responseWithNextPage);

    getFollowings(args, callback);

    expect(callback).toHaveBeenCalled();

    await expect(queryFollowings(args)).resolves.toBeTruthy();

    expect(callback.mock.lastCall).toHaveLength(1);

    const { onNextPage, hasNextPage } = callback.mock.lastCall[0];

    expect(hasNextPage).toBe(true);
    expect(onNextPage).toBeTruthy();

    client.http.get = jest.fn().mockResolvedValue(response);

    onNextPage();

    await expect(queryFollowings(args)).resolves.toBeTruthy();

    expect(callback).toHaveBeenCalledTimes(4);

    snapshot.loading = false;
    snapshot.data = [...responseWithNextPage.data.follows, ...response.data.follows];
    expect(callback).toHaveBeenNthCalledWith(4, expect.objectContaining(snapshot));
  });

  const createEvents: [keyof Amity.Events][] = [
    ['follow.created'],
    ['follow.requested'],
    ['follow.accepted'],
  ];

  test.each(createEvents)('it should add new follow to collection on %s', async event => {
    const snapshot = getSnapshot();
    const newFollowing: Amity.FollowStatus = {
      ...follow11,
      to: 'some-user',
    };
    const response = { data: { follows: follows.page1, paging: {} } };

    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(response);

    getFollowings(args, callback);

    await expect(queryFollowings(args)).resolves.toBeTruthy();
    expect(callback).toHaveBeenCalledTimes(2);

    client.emitter.emit(event, { follows: [newFollowing] });

    snapshot.loading = false;
    snapshot.data = [newFollowing, ...response.data.follows];
    expect(callback).toHaveBeenNthCalledWith(3, expect.objectContaining(snapshot));
  });

  const removeEvents: [keyof Amity.Events][] = [
    ['follow.requestDeclined'],
    ['follow.requestCanceled'],
    ['follow.unfollowed'],
    ['follow.followerDeleted'],
  ];

  test.each(removeEvents)('it should remove a follow to collection on %s', async event => {
    const snapshot = getSnapshot();
    const response = { data: { follows: follows.page1, paging: {} } };

    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(response);

    getFollowings(args, callback);

    await expect(queryFollowings(args)).resolves.toBeTruthy();
    expect(callback).toHaveBeenCalledTimes(2);

    client.emitter.emit(event, { follows: [response.data.follows[0]] });

    const [first, ...data] = response.data.follows;

    snapshot.data = data;
    snapshot.loading = false;
    expect(callback).toHaveBeenNthCalledWith(3, expect.objectContaining(snapshot));
  });
});
