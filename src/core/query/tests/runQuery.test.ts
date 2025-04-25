import { ASCApiError } from '~/core/errors';
import { disableCache, enableCache, pushToCache } from '~/cache/api';
import { createQuery, runQuery } from '~/core/query';
import { createPost } from '~/postRepository/api';
import { getPost } from '~/postRepository/api/getPost';
import { softDeleteMessage } from '~/messageRepository/api';

import { client, deepCopy, emptyPostPayload, pause, post11, user11 } from '~/utils/tests';

const createPostArgs: Parameters<typeof createPost> = [
  {
    tags: ['a', 'b'],
    data: {
      text: 'hello!',
    },
    targetType: 'user',
    targetId: 'userId1',
  },
];
const post = post11;
const deletingMsgId = 'deletingId';

describe('Core/Query/runQuery', () => {
  beforeAll(enableCache);
  afterAll(disableCache);

  beforeEach(enableCache);
  afterEach(disableCache);

  test('should call query with arguments', () => {
    const createPostMock = jest.fn().mockResolvedValue('test');

    const query = createQuery(createPostMock, createPostArgs);
    runQuery(query);

    expect(createPostMock).toBeCalledTimes(1);
  });

  test('should call callback with cache when valid', () => {
    const callback = jest.fn();

    const cachedAt = Date.now();
    pushToCache(['post', 'get', post.postId], post, { cachedAt });
    pushToCache(['user', 'get', user11.userId], user11);

    const query = createQuery(getPost, post.postId);
    runQuery(query, callback);

    expect(callback).toBeCalled();
    expect(callback).toBeCalledTimes(1);

    expect(deepCopy(callback.mock.calls[0][0])).toEqual(
      expect.objectContaining(
        deepCopy({
          cachedAt,
          origin: 'local',
          loading: false,
          data: post,
        }),
      ),
    );
  });

  test('should call callback with server data for invalid cache', async () => {
    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue({
      data: {
        ...emptyPostPayload,
        posts: [post],
      },
    });

    // at the time of writing this test, cache is valid for 2 minutes
    const expiredDate = Date.parse('04 Dec 1995 00:12:00 GMT');
    pushToCache(['post', 'get', post.postId], post, { cachedAt: expiredDate });
    pushToCache(['user', 'get', user11.userId], user11);

    const query = createQuery(getPost, post.postId);
    runQuery(query, callback);

    expect(deepCopy(callback.mock.calls[0][0])).toEqual(
      expect.objectContaining(
        deepCopy({
          cachedAt: expiredDate,
          origin: 'local',
          loading: true,
          data: post,
        }),
      ),
    );

    await expect(getPost(post.postId)).resolves.toBeTruthy();

    expect(callback).toHaveBeenCalledTimes(2);
    // checking an object containing as expiredAt cannot be predicted :D
    expect(deepCopy(callback.mock.calls[1][0])).toEqual(
      expect.objectContaining(
        deepCopy({
          origin: 'server',
          loading: false,
          data: post,
        }),
      ),
    );
  });

  test('should execute mutators optimistically', () => {
    const createMessage: any = jest.fn().mockResolvedValue('test');
    // mutators are defined as having a property called optimistically
    createMessage.optimistically = jest.fn();

    const query = createQuery(createMessage);
    runQuery(query);

    expect(createMessage.optimistically).toHaveBeenCalled();
    // should call server right after
    expect(createMessage).toHaveBeenCalled();
  });

  /*
   * NOTE: del not tested as the args are exactly the same as update
   *
   * Tested due to bug where optimistic args was modifying args for del &
   * update when it does not need to
   */
  test('should not change args optimistically for update', () => {
    client.http.delete = jest.fn().mockResolvedValue(true);
    // 'get', gets called after delete to verify delete
    client.http.get = jest.fn();

    const query = createQuery(softDeleteMessage, deletingMsgId);
    runQuery(query);

    expect(client.http.delete).toHaveBeenCalledWith(`/api/v5/messages/${deletingMsgId}`);
  });

  test('should throw error if optimistic execution fails', async () => {
    const callback = jest.fn();
    const createMessage: any = jest.fn().mockResolvedValue('test');
    // mutators are defined as having a property called optimistically
    createMessage.optimistically = jest.fn().mockImplementation(() => {
      throw new Error();
    });

    const query = createQuery(createMessage);
    runQuery(query, callback);

    expect(createMessage.optimistically).toThrow();
    expect(callback).toBeCalledWith({
      origin: 'local',
      loading: true,
      data: undefined,
    });
  });

  test('should return error if call to server fails', async () => {
    client.http.delete = jest
      .fn()
      .mockRejectedValueOnce(
        new ASCApiError('not found!', Amity.ServerError.ITEM_NOT_FOUND, Amity.ErrorLevel.ERROR),
      );
    const callback = jest.fn();

    const query = createQuery(softDeleteMessage, deletingMsgId);
    runQuery(query, callback);
    await pause();

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(1, {
      origin: 'local',
      loading: true,
      data: undefined,
    });
    expect(callback).toHaveBeenNthCalledWith(2, {
      origin: 'server',
      loading: false,
      error: expect.any(Error),
    });
  });
});
