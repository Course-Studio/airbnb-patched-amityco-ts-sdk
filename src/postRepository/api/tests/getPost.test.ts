import { ASCApiError } from '~/core/errors';
import { client, emptyPostPayload, post11, post12, user11 } from '~/utils/tests';
import { disableCache, enableCache, pushToCache } from '~/cache/api';

import { getPost } from '~/postRepository/api/getPost';

describe('post/api', () => {
  describe('getPost.locally', () => {
    test('should return undefined if cache is turned off', () => {
      expect(getPost.locally(post11.postId)).toBeUndefined();
    });

    test('should return undefined if post not in cache', () => {
      enableCache();

      const cachedAt = Date.now();

      pushToCache(['user', 'get', post11.postedUserId], user11, { cachedAt });
      pushToCache(['post', 'get', post11.postId], post11, { cachedAt });

      expect(getPost.locally(post12.postId)).toBeUndefined();

      disableCache();
    });

    test('should return post if post in cache', () => {
      enableCache();

      const cachedAt = Date.now();

      pushToCache(['user', 'get', post11.postedUserId], user11, { cachedAt });
      pushToCache(['post', 'get', post11.postId], post11, { cachedAt });

      const postData = getPost.locally(post11.postId);

      expect(postData).toBeDefined();

      if (postData?.data) {
        expect(postData.cachedAt).toEqual(cachedAt);

        const { analytics, ...returnedData } = postData.data;
        expect(post11).toEqual(expect.objectContaining(returnedData));
      }

      disableCache();
    });
  });

  describe('getPost', () => {
    test('should return a post', async () => {
      client.http.get = jest.fn().mockReturnValueOnce({
        data: {
          ...emptyPostPayload,
          posts: [post11],
          users: [user11],
        },
      });

      const cachedData = await getPost(post11.postId);

      expect(cachedData).toBeDefined();

      if (cachedData) {
        // Linked Object will not work if the cache is disabled
        const {
          data: { analytics, latestComments, creator, ...returnedData },
        } = cachedData;

        expect(post11).toEqual(expect.objectContaining(returnedData));
      }
    });

    test('should put post into the cache after fetch', async () => {
      enableCache();
      client.http.get = jest.fn().mockReturnValueOnce({
        data: {
          ...emptyPostPayload,
          posts: [post11],
          users: [user11],
        },
      });

      await getPost(post11.postId);

      expect(getPost.locally(post11.postId)?.data).toHaveProperty('postId', post11.postId);

      disableCache();
    });

    test('should return an error', async () => {
      client.http.get = jest.fn().mockRejectedValueOnce(new Error('error'));

      await expect(getPost(post11.postId)).rejects.toThrow('error');
    });

    test('should return an error if post in cache but api throws not found', async () => {
      enableCache();

      pushToCache(['user', 'get', post11.postedUserId], user11, { cachedAt: Date.now() });
      pushToCache(['post', 'get', post11.postId], post11, { cachedAt: Date.now() });

      client.http.get = jest
        .fn()
        .mockRejectedValueOnce(
          new ASCApiError('not found!', Amity.ServerError.ITEM_NOT_FOUND, Amity.ErrorLevel.ERROR),
        );

      await expect(getPost(post11.postId)).rejects.toThrow();

      expect(getPost.locally(post11.postId)).toBeUndefined();
      disableCache();
    });
  });
});
