import { generatePost } from '~/utils/tests/dummy';
import { pause } from '~/utils/tests/utils';
import { connectClient, disconnectClient } from '~/utils/tests/client';
import { disableCache, enableCache } from '~/cache/api';
import { getFutureDate, getPastDate } from '~/core/model';
import { LIVE_OBJECT_ENABLE_CACHE_MESSAGE } from '~/utils/constants';
import { liveObject } from '../liveObject';

describe('liveObject', () => {
  let post: Amity.Post;
  let fetcher: jest.Mock;
  let callback: jest.Mock;
  let eventCallback: Amity.Listener<Amity.Post>;
  let eventUnsubscriber: jest.Mock;
  const onEvent = (fn: Amity.Listener<Amity.Post>) => {
    eventCallback = fn;
    eventUnsubscriber = jest.fn();

    return eventUnsubscriber;
  };
  let unsubscribe: Amity.Unsubscriber;

  beforeAll(async () => {
    await connectClient();
  });

  afterAll(async () => {
    await disconnectClient();
  });

  beforeEach(() => {
    enableCache();

    callback = jest.fn();
    post = generatePost({ postId: 'my-post-id' });
    fetcher = jest.fn().mockResolvedValue(post);
  });

  afterEach(() => {
    disableCache();
    unsubscribe();
  });

  test('it should show message if cache not enabled', () => {
    /*
     * NOTE: at the time of writing this test cache is disabled by default, but
     * there is a proposal to enable cache by default. So I'm disabling cache
     * here to ensure cache is disabled
     */
    disableCache();
    jest.spyOn(global.console, 'log');

    unsubscribe = liveObject<Amity.Post, 'postId'>(post.postId, callback, 'postId', fetcher, []);

    expect(console.log).toBeCalledWith(LIVE_OBJECT_ENABLE_CACHE_MESSAGE);
  });

  it('should fetch the model', async () => {
    unsubscribe = liveObject<Amity.Post, 'postId'>(post.postId, callback, 'postId', fetcher, []);
    await pause();

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ data: undefined, loading: true }),
    );
    expect(callback).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        data: post,
        loading: false,
      }),
    );
  });

  it('should provide the error if fetch is failed', async () => {
    const error = new Error('can not fetch');

    unsubscribe = liveObject<Amity.Post, 'postId'>(
      post.postId,
      callback,
      'postId',
      () => {
        return Promise.reject(error);
      },
      [onEvent],
    );
    await pause();

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ data: undefined, loading: true }),
    );
    expect(callback).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        data: undefined,
        error,
        loading: false,
      }),
    );
    expect(eventUnsubscriber).toHaveBeenCalledTimes(1);
  });

  it('should update the model on the event', async () => {
    const update = {
      ...post,
      data: { text: 'new-text' },
      updatedAt: getFutureDate(post.updatedAt),
    };

    unsubscribe = liveObject<Amity.Post, 'postId'>(post.postId, callback, 'postId', fetcher, [
      onEvent,
    ]);
    await pause();
    eventCallback(update);
    await pause();

    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        data: update,
        loading: false,
      }),
    );
  });

  it('should not update the model on the event if the model has different id', async () => {
    const post2 = generatePost({
      postId: 'my-post-id-2',
      updatedAt: getFutureDate(post.updatedAt),
    });

    unsubscribe = liveObject<Amity.Post, 'postId'>(post.postId, callback, 'postId', fetcher, [
      onEvent,
    ]);
    await pause();
    eventCallback(post2);
    await pause();

    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should unsubscribe from events on liveObject disposing', async () => {
    unsubscribe = liveObject<Amity.Post, 'postId'>(post.postId, callback, 'postId', fetcher, [
      onEvent,
    ]);
    await pause();
    unsubscribe();

    expect(eventUnsubscriber).toHaveBeenCalledTimes(1);
  });
});
