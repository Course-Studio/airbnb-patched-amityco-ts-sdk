import { disableCache, enableCache, pullFromCache } from '~/cache/api';

import { client, community11, community21, communityUser11 } from '~/utils/tests';

import { queryCommunities } from '../queryCommunities';

const communities = [community11, community21];

const pagingToken = {
  previous: 'eyJiZWZvcmUiOjU1LCJsYXN0IjoxMH0=',
  next: 'eyJiZWZvcmUiOjU1LCJsYXN0IjoxMH0=',
};

const communitiesToQuery = [community11];
const communityIdsToQuery = communitiesToQuery.map(community => community.communityId);
const communityUsersToQuery = [communityUser11];
const queryCriteriaWithoutQueryToken = { displayName: communities[0].displayName, limit: 10 };
const queryCriteriaWithQueryToken = {
  ...queryCriteriaWithoutQueryToken,
  page: pagingToken.next,
};

const resolvedGetValue = {
  data: {
    communities: communitiesToQuery,
    communityUsers: communityUsersToQuery,
    files: [],
    users: [],
    categories: [],
    feeds: [],
    paging: pagingToken,
  },
};

describe('queryCommunities', () => {
  test('should return fetched communities with correct paging', async () => {
    client.http.get = jest.fn().mockResolvedValueOnce(resolvedGetValue);

    await expect(queryCommunities(queryCriteriaWithoutQueryToken)).resolves.toEqual(
      expect.objectContaining({
        data: communitiesToQuery,
        paging: pagingToken,
      }),
    );
  });

  test('should update cache after fetching communities', async () => {
    enableCache();
    client.http.get = jest.fn().mockResolvedValue(resolvedGetValue);

    await queryCommunities(queryCriteriaWithQueryToken);

    const { page, limit, ...params } = queryCriteriaWithQueryToken;

    const recieved = pullFromCache([
      'community',
      'query',
      {
        ...params,
        options: { token: queryCriteriaWithQueryToken.page },
      },
    ])?.data;

    expect(recieved).toEqual({
      communities: communityIdsToQuery,
      paging: pagingToken,
    });

    disableCache();
  });

  test('should throw an error if request fails', async () => {
    client.http.get = jest.fn().mockRejectedValueOnce(new Error('error'));

    await expect(queryCommunities(queryCriteriaWithQueryToken)).rejects.toThrow('error');
  });

  test('it should set isDeleted to undefined if includeDeleted is true', async () => {
    const mockFn = jest.fn();
    client.http.get = mockFn.mockResolvedValue(resolvedGetValue);

    await queryCommunities({ ...queryCriteriaWithoutQueryToken, includeDeleted: true });

    expect(mockFn.mock.lastCall).toHaveLength(2);
    expect(mockFn.mock.lastCall[1].params.isDeleted).toBeUndefined();
  });

  test('it should set isDeleted to false if includeDeleted is false', async () => {
    const mockFn = jest.fn();
    client.http.get = mockFn.mockResolvedValue(resolvedGetValue);

    await queryCommunities({ ...queryCriteriaWithoutQueryToken, includeDeleted: false });

    expect(mockFn.mock.lastCall).toHaveLength(2);
    expect(mockFn.mock.lastCall[1].params.isDeleted).toBe(false);
  });

  test('it should set isDeleted to false if includeDeleted is undefined', async () => {
    const mockFn = jest.fn();
    client.http.get = mockFn.mockResolvedValue(resolvedGetValue);

    await queryCommunities(queryCriteriaWithoutQueryToken);

    expect(mockFn.mock.lastCall).toHaveLength(2);
    expect(mockFn.mock.lastCall[1].params.isDeleted).toBe(false);
  });
});
