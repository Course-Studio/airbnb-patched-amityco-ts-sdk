import { disableCache, enableCache, pullFromCache } from '~/cache/api';
import { client, community11, community21 } from '~/utils/tests';

import { getTrendingCommunities } from '../getTrendingCommunities';

const topTrendCommunities = [community11, community21];

const pagingToken = {
  previous: 'eyJiZWZvcmUiOjU1LCJsYXN0IjoxMH0=',
  next: 'eyJiZWZvcmUiOjU1LCJsYXN0IjoxMH0=',
};

const pagingCriteria = { limit: 10 };

const resolvedGetValue = {
  data: {
    communities: topTrendCommunities,
    communityUsers: [],
    files: [],
    users: [],
    categories: [],
    feeds: [],
    paging: pagingToken,
  },
};

describe('getTrendingCommunities', () => {
  test('should return fetched top trend communities with correct paging', async () => {
    client.http.get = jest.fn().mockResolvedValueOnce(resolvedGetValue);

    await expect(getTrendingCommunities(pagingCriteria)).resolves.toEqual(
      expect.objectContaining({ data: topTrendCommunities }),
    );
  });

  test('should update cache after fetching top trend communities', async () => {
    enableCache();
    client.http.get = jest.fn().mockResolvedValue(resolvedGetValue);

    await getTrendingCommunities(pagingCriteria);

    const community1 = pullFromCache(['community', 'get', community11.communityId])?.data;
    const community2 = pullFromCache(['community', 'get', community21.communityId])?.data;

    expect(community1).toStrictEqual(community11);
    expect(community2).toStrictEqual(community21);

    disableCache();
  });

  test('should throw an error if request fails', async () => {
    client.http.get = jest.fn().mockRejectedValueOnce(new Error('error'));

    await expect(getTrendingCommunities(pagingCriteria)).rejects.toThrow('error');
  });
});
