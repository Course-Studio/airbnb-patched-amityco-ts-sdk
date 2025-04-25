import { disableCache, enableCache, pullFromCache, pushToCache } from '~/cache/api';

import { client, deepCopy, post11, post12, user11 } from '~/utils/tests';

import { queryGlobalFeed } from '../queryGlobalFeed';

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

describe('queryGlobalFeed', () => {
  test('should return fetched feed with correct paging', async () => {
    client.http.get = jest.fn().mockResolvedValueOnce(resolvedQueryFeedValue);

    const result = await queryGlobalFeed(queryCriteria);
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

  test('should accept undefined query param', async () => {
    client.http.get = jest.fn().mockResolvedValueOnce(resolvedQueryFeedValue);

    await expect(queryGlobalFeed()).resolves.not.toThrow();
  });

  test('should update cache after fetching feed', async () => {
    enableCache();
    client.http.get = jest.fn().mockResolvedValue(resolvedQueryFeedValue);

    await queryGlobalFeed(queryCriteria);

    const recieved = pullFromCache([
      'globalFeed',
      'query',
      { ...queryCriteriaWithoutPage, options: pagingCriteria },
    ])?.data;

    expect(recieved).toEqual({
      posts: postIdsToQuery,
      paging: pagingToken,
    });

    disableCache();
  });

  test('should throw an error if request fails', async () => {
    client.http.get = jest.fn().mockRejectedValueOnce(new Error('error'));

    await expect(queryGlobalFeed(queryCriteria)).rejects.toThrow('error');
  });
});

describe('queryGlobalFeed.locally', () => {
  beforeEach(enableCache);
  afterEach(disableCache);

  test('should return cached feed', () => {
    postsToQuery.forEach(post => pushToCache(['post', 'get', post.postId], post));

    pushToCache(['globalFeed', 'query', { ...queryCriteriaWithoutPage, options: pagingCriteria }], {
      posts: postIdsToQuery,
      paging: pagingToken,
    });
    pushToCache(['user', 'get', user11.userId], user11);

    expect(deepCopy(queryGlobalFeed.locally(queryCriteria))).toEqual(
      expect.objectContaining(
        deepCopy({
          data: postsToQuery,
          prevPage: { before: 55, limit: 10 },
          nextPage: { before: 55, limit: 10 },
        }),
      ),
    );
  });

  test('should accept undefined query param', async () => {
    client.http.get = jest.fn().mockResolvedValueOnce(resolvedQueryFeedValue);

    expect(() => queryGlobalFeed.locally()).not.toThrow();
  });

  test(`shouldn't return if individual feed cache not exist`, () => {
    pushToCache(['globalFeed', 'query', { ...queryCriteriaWithoutPage, options: pagingCriteria }], {
      posts: postIdsToQuery,
      paging: pagingToken,
    });

    expect(queryGlobalFeed.locally(queryCriteria)).toBeUndefined();
  });

  test('it should return undefined if feed not in cache', () => {
    expect(queryGlobalFeed.locally({})).toBeUndefined();
  });

  test('it should return undefined if cache disabled', () => {
    disableCache();

    expect(queryGlobalFeed.locally({})).toBeUndefined();
  });
});
