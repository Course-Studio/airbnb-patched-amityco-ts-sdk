import { disableCache, enableCache, pullFromCache } from '~/cache/api';
import { client, community11, community21 } from '~/utils/tests';

import { getRecommendedCommunities } from '../getRecommendedCommunities';

const recommendedCommunities = [community11, community21];

const pagingToken = {
  previous: 'eyJiZWZvcmUiOjU1LCJsYXN0IjoxMH0=',
  next: 'eyJiZWZvcmUiOjU1LCJsYXN0IjoxMH0=',
};

const pagingCriteria = { limit: 10 };

const resolvedGetValue = {
  data: {
    communities: recommendedCommunities,
    communityUsers: [community11, community21],
    files: [],
    users: [],
    categories: [],
    feeds: [],
    paging: pagingToken,
  },
};

describe('getRecommendedCommunities', () => {
  test('should return fetched recommended communities with correct paging', async () => {
    client.http.get = jest.fn().mockResolvedValueOnce(resolvedGetValue);

    await expect(getRecommendedCommunities(pagingCriteria)).resolves.toEqual(
      expect.objectContaining({ data: recommendedCommunities }),
    );
  });

  test('should update cache after fetching recommended communities', async () => {
    enableCache();
    client.http.get = jest.fn().mockResolvedValue(resolvedGetValue);

    await getRecommendedCommunities(pagingCriteria);

    const community1 = pullFromCache(['community', 'get', community11.communityId])?.data;
    const community2 = pullFromCache(['community', 'get', community21.communityId])?.data;

    expect(community1).toStrictEqual(community11);
    expect(community2).toStrictEqual(community21);

    disableCache();
  });

  test('should throw an error if request fails', async () => {
    client.http.get = jest.fn().mockRejectedValueOnce(new Error('error'));

    await expect(getRecommendedCommunities(pagingCriteria)).rejects.toThrow('error');
  });
});
