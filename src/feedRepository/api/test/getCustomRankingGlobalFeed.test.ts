import { disableCache, enableCache, pullFromCache, pushToCache } from '~/cache/api';

import { client, deepCopy, post11, post12, user11 } from '~/utils/tests';

import { getCustomRankingGlobalFeed } from '../getCustomRankingGlobalFeed';

const pagingToken = {
  previous: 'eyJiZWZvcmUiOjU1LCJsYXN0IjoxMH0=',
  next: 'eyJiZWZvcmUiOjU1LCJsYXN0IjoxMH0=',
};

const postsToQuery = [post11, post12];
const postIdsToQuery = postsToQuery.map(post => post.postId);
const pagingCriteria = { limit: 10 };
const queryCriteriaWithoutPage = {};
const queryCriteria = { ...queryCriteriaWithoutPage };

const resolvedQueryFeedValue = {
  data: {
    posts: postsToQuery,
    postChildren: [],
    categories: [],
    comments: [],
    communityUsers: [],
    feeds: [],
    files: [],
    polls: [],
    users: [user11],
    paging: pagingToken,
  },
};

describe('getCustomRankingGlobalFeed', () => {
  test('it should return fetched feed with correct paging', async () => {
    client.http.get = jest.fn().mockResolvedValueOnce(resolvedQueryFeedValue);

    const result = await getCustomRankingGlobalFeed(queryCriteria);

    expect(deepCopy(result)).toEqual(
      expect.objectContaining(
        deepCopy({
          data: postsToQuery,
          prevPage: { before: 55, limit: 10 },
          nextPage: { before: 55, limit: 10 },
        }),
      ),
    );
  });

  test('it should update cache after fetching feed', async () => {
    enableCache();
    client.http.get = jest.fn().mockResolvedValue(resolvedQueryFeedValue);

    await getCustomRankingGlobalFeed(queryCriteria);

    const recieved = pullFromCache([
      'customGlobalFeed',
      'query',
      { ...queryCriteriaWithoutPage, options: pagingCriteria },
    ])?.data;

    expect(recieved).toEqual({
      posts: postIdsToQuery,
      paging: pagingToken,
    });

    disableCache();
  });

  test('it should call the correct api', async () => {
    const resolver = jest.fn().mockResolvedValue(resolvedQueryFeedValue);
    client.http.get = resolver;

    await getCustomRankingGlobalFeed(queryCriteria);

    expect(resolver).toHaveBeenCalledWith(`/api/v5/me/global-feeds`, expect.any(Object));
  });

  test('it should throw an error if request fails', async () => {
    client.http.get = jest.fn().mockRejectedValueOnce(new Error('error'));

    await expect(getCustomRankingGlobalFeed(queryCriteria)).rejects.toThrow('error');
  });
});

describe('getCustomRankingGlobalFeed.locally', () => {
  beforeEach(enableCache);
  afterEach(disableCache);

  test('it should return cached feed', () => {
    postsToQuery.forEach(post => pushToCache(['post', 'get', post.postId], post));

    pushToCache(
      ['customGlobalFeed', 'query', { ...queryCriteriaWithoutPage, options: pagingCriteria }],
      {
        posts: postIdsToQuery,
        paging: pagingToken,
      },
    );

    pushToCache(['user', 'get', user11.userId], user11);

    expect(deepCopy(getCustomRankingGlobalFeed.locally(queryCriteria))).toEqual(
      expect.objectContaining(
        deepCopy({
          data: postsToQuery,
          prevPage: { before: 55, limit: 10 },
          nextPage: { before: 55, limit: 10 },
        }),
      ),
    );
  });

  test('it should accept undefined query param', async () => {
    client.http.get = jest.fn().mockResolvedValueOnce(resolvedQueryFeedValue);

    expect(() => getCustomRankingGlobalFeed.locally()).not.toThrow();
  });

  test(`it shouldn't return if individual feed cache not exist`, () => {
    pushToCache(['globalFeed', 'query', { ...queryCriteriaWithoutPage, options: pagingCriteria }], {
      posts: postIdsToQuery,
      paging: pagingToken,
    });

    expect(getCustomRankingGlobalFeed.locally(queryCriteria)).toBeUndefined();
  });

  test('it should return undefined if feed not in cache', () => {
    expect(getCustomRankingGlobalFeed.locally({})).toBeUndefined();
  });

  test('it should return undefined if cache disabled', () => {
    disableCache();

    expect(getCustomRankingGlobalFeed.locally({})).toBeUndefined();
  });
});
