import { client, deepCopy, post11, postQueryResponse } from '~/utils/tests';

import { queryPosts } from '../queryPosts';

const { targetId, targetType } = post11;
const params = { targetId, targetType };

describe('queryPosts', () => {
  test('it should return posts', async () => {
    const { posts: expected } = postQueryResponse.data;
    client.http.get = jest.fn().mockResolvedValue(postQueryResponse);

    const { data } = await queryPosts(params);

    expect(deepCopy(data)).toEqual(deepCopy(expected));
  });

  test('it should throw error', async () => {
    client.http.get = jest.fn().mockRejectedValueOnce(new Error('error'));

    await expect(queryPosts(params)).rejects.toThrow('error');
  });

  test('it should send matchingOnlyParentPost as true if there are no dataTypes', async () => {
    const mockFn = jest.fn();
    client.http.get = mockFn.mockResolvedValue(postQueryResponse);

    await queryPosts(params);

    const mockFnParams = mockFn.mock.lastCall;

    expect(mockFnParams).toBeDefined();
    expect(mockFnParams).toHaveLength(2);
    expect(mockFnParams[1].params.matchingOnlyParentPost).toBe(true);
  });

  test('it should send matchingOnlyParentPost as false if there are dataTypes', async () => {
    const mockFn = jest.fn();
    client.http.get = mockFn.mockResolvedValue(postQueryResponse);

    await queryPosts({ ...params, dataTypes: ['image'] });

    const mockFnParams = mockFn.mock.lastCall;

    expect(mockFnParams).toBeDefined();
    expect(mockFnParams).toHaveLength(2);
    expect(mockFnParams[1].params.matchingOnlyParentPost).toBe(false);
  });

  test('it should set isDeleted to undefined if includeDeleted is true', async () => {
    const mockFn = jest.fn();
    client.http.get = mockFn.mockResolvedValue(postQueryResponse);

    await queryPosts({ ...params, includeDeleted: true });

    expect(mockFn.mock.lastCall).toHaveLength(2);
    expect(mockFn.mock.lastCall[1].params.isDeleted).toBeUndefined();
  });

  test('it should set isDeleted to false if includeDeleted is false', async () => {
    const mockFn = jest.fn();
    client.http.get = mockFn.mockResolvedValue(postQueryResponse);

    await queryPosts({ ...params, includeDeleted: false });

    expect(mockFn.mock.lastCall).toHaveLength(2);
    expect(mockFn.mock.lastCall[1].params.isDeleted).toBe(false);
  });

  test('it should set isDeleted to undefined if includeDeleted is undefined', async () => {
    const mockFn = jest.fn();
    client.http.get = mockFn.mockResolvedValue(postQueryResponse);

    await queryPosts({ ...params, includeDeleted: true });

    expect(mockFn.mock.lastCall).toHaveLength(2);
    expect(mockFn.mock.lastCall[1].params.isDeleted).toBeUndefined();
  });
});
