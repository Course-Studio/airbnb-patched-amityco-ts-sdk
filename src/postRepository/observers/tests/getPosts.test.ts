import { disableCache, enableCache } from '~/cache/api';

import {
  client,
  connectClient,
  deepCopy,
  disconnectClient,
  emptyPostPayload,
  pause,
  post11,
  post14,
  postQueryResponse,
  postQueryResponsePage2,
} from '~/utils/tests';

import { getPosts } from '../getPosts';

const getSnapshot = () => {
  return {
    data: [] as Amity.Post[],
    loading: true,
    error: undefined as any,
  };
};

const { targetId, targetType } = post11;
const params = { targetId, targetType };

describe('getPosts', () => {
  beforeAll(async () => {
    await connectClient();
  });

  afterAll(async () => {
    await disconnectClient();
  });

  beforeEach(enableCache);

  afterEach(disableCache);

  test('it should return post collection', async () => {
    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(postQueryResponse);

    getPosts(params, callback);

    expect(callback).toHaveBeenCalledTimes(1);

    const snapshot = getSnapshot();

    // check if cache data returned (should be empty)
    expect(callback).toHaveBeenCalledWith(expect.objectContaining(snapshot));

    await pause();

    expect(callback).toHaveBeenCalledTimes(2);

    // because we apply prepareChannelPayload on post raw data from server
    const payload = postQueryResponse.data;

    snapshot.data = payload.posts;
    snapshot.loading = false;

    // expect all object except function to equal
    expect(deepCopy(callback.mock.calls[1][0])).toEqual({
      ...deepCopy({
        ...snapshot,
        hasNextPage: true,
      }),
    });
  });

  const filters: [string, Amity.PostLiveCollection, number?][] = [
    ['not deleted', { ...params, includeDeleted: false }],
    ['tags', { ...params, tags: ['test_tag'], includeDeleted: true }, 1],
  ];

  test.each(filters)(
    'it should filter by %s posts',
    async (filter, params, expectedPostIdx = 0) => {
      const callback = jest.fn();
      client.http.get = jest.fn().mockResolvedValue(postQueryResponsePage2);

      const payload = postQueryResponsePage2.data;
      const snapshotData = [payload.posts[expectedPostIdx]];

      getPosts(params, callback);

      expect(callback).toHaveBeenCalledTimes(1);

      const snapshot = getSnapshot();
      // check if cache data returned (should be empty)
      expect(callback).toHaveBeenCalledWith(expect.objectContaining(snapshot));

      await pause();

      expect(callback).toHaveBeenCalledTimes(2);

      snapshot.loading = false;
      snapshot.data = snapshotData;

      expect(deepCopy(callback.mock.calls[1][0])).toEqual(
        expect.objectContaining(deepCopy(snapshot)),
      );
    },
  );

  test('it should return method to fetch next page', async () => {
    const callback = jest.fn();
    client.http.get = jest
      .fn()
      .mockResolvedValue(postQueryResponse)
      .mockResolvedValueOnce(postQueryResponsePage2);

    getPosts({ ...params, includeDeleted: true }, callback);

    expect(callback).toHaveBeenCalled();

    await pause();

    expect(callback.mock.lastCall).toHaveLength(1);

    const { onNextPage, hasNextPage } = callback.mock.lastCall[0];

    expect(hasNextPage).toBe(true);
    expect(onNextPage).toBeTruthy();

    onNextPage();

    await pause();

    // 4 -> becuase 1 local & server call each per call (2)
    expect(callback).toHaveBeenCalledTimes(4);

    const payload = postQueryResponse.data;
    const payload2 = postQueryResponsePage2.data;

    const snapshot = getSnapshot();
    snapshot.loading = false;
    snapshot.data = [...payload2.posts, ...payload.posts];

    expect(deepCopy(callback.mock.calls[3][0])).toEqual(
      expect.objectContaining(deepCopy(snapshot)),
    );
  });

  const events: [string, keyof Amity.Events, Amity.Post, Amity.PostLiveCollection][] = [
    [
      'it should add new post to collection onCreate',
      'post.created',
      { ...post11, postId: 'new-post-id' },
      params,
    ],
    ['it should edit post in collection onUpdate', 'post.updated', post11, params],
    [
      'it should update post in collection onApproved',
      'post.approved',
      { ...post11, postId: 'approved-post-id' },
      params,
    ],
    [
      'it should remove post in collection onDelete',
      'post.deleted',
      { ...post11, isDeleted: true },
      { ...params, includeDeleted: false },
    ],
    ['it should remove post in collection onDeclined', 'post.declined', post11, params],
  ];

  test.each(events)('%s', async (test, event, post, params) => {
    const snapshot = getSnapshot();

    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(postQueryResponse);

    getPosts(params, callback);

    await pause();
    expect(callback).toHaveBeenCalledTimes(2);

    client.emitter.emit(event, { ...emptyPostPayload, posts: [post] });

    const payload = postQueryResponse.data;
    const deletePayload = payload.posts.filter(p => p.postId !== post.postId);

    snapshot.loading = false;
    // get data based on event
    switch (event) {
      case 'post.created':
      case 'post.approved':
        snapshot.data = [post, ...payload.posts];
        break;

      case 'post.deleted':
      case 'post.declined':
        snapshot.data = deletePayload;
        break;

      case 'post.addReaction':
        payload.posts[0] = post;
        snapshot.data = payload.posts;
        break;

      default:
        snapshot.data = payload.posts;
    }

    expect(deepCopy(callback.mock.calls[2][0])).toEqual(
      expect.objectContaining(deepCopy(snapshot)),
    );
  });

  const reactionEvents: [
    string,
    keyof Amity.Events,
    Amity.PostPayload & { reactor: Amity.InternalReactor },
  ][] = [
    [
      'it should update post in collection onReactionAdded',
      'post.addReaction',
      {
        ...emptyPostPayload,
        posts: [{ ...post11, reactionsCount: 1 }],
        reactor: {
          reactionId: 'test-reaction-id',
          reactionName: 'like',
          userId: 'test',
          createdAt: '',
        },
      },
    ],
    [
      'it should update post in collection onReactionRemoved',
      'post.removeReaction',
      {
        ...emptyPostPayload,
        posts: [{ ...post11, reactionsCount: 0 }],
        reactor: {
          reactionId: 'test-reaction-id',
          reactionName: 'like',
          userId: 'test',
          createdAt: '',
        },
      },
    ],
  ];

  test.each(reactionEvents)('%s', async (test, event, reactionPayload) => {
    const expectedReactionCount = reactionPayload.posts[0].reactionsCount;

    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(postQueryResponse);

    getPosts(params, callback);

    await pause();
    expect(callback).toHaveBeenCalledTimes(2);

    client.emitter.emit(event, reactionPayload);

    const { reactionsCount } = callback.mock.lastCall[0].data[0];
    expect(reactionsCount).toBe(expectedReactionCount);
  });

  /*
   * This test was added as when isDeleted posts were queried, the getPosts api
   * would try to delete the post when 'post.deleted' event occured, where instead
   * it should be adding it to the collection. As getPosts is called with a
   * param to reutrun deleted posts only
   */
  test('it should update posts to include deleted post', async () => {
    const deletedPost = { ...post11, isDeleted: true };
    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(postQueryResponsePage2);

    getPosts({ ...params, includeDeleted: true }, callback);

    await pause();
    const payload = postQueryResponsePage2.data.posts;
    const snapshot = getSnapshot();

    snapshot.data = payload;
    snapshot.loading = false;

    expect(deepCopy(callback.mock.calls[1][0])).toEqual(
      expect.objectContaining(deepCopy(snapshot)),
    );

    client.emitter.emit('post.deleted', {
      ...emptyPostPayload,
      posts: [deletedPost],
    });

    snapshot.data = [deletedPost, ...payload];
    expect(deepCopy(callback.mock.calls[2][0])).toEqual(
      expect.objectContaining(deepCopy(snapshot)),
    );
  });

  test('it should remove approved post when feedtype reviewing', async () => {
    const feedId = 'publishedFeed';
    const approvedPost = { ...post14, feedId };

    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(postQueryResponsePage2);

    getPosts(
      { ...params, targetType: 'community', feedType: 'reviewing', includeDeleted: true },
      callback,
    );

    await pause();
    const payload = postQueryResponsePage2.data.posts;
    const snapshot = getSnapshot();

    snapshot.data = payload;
    snapshot.loading = false;

    expect(deepCopy(callback.mock.calls[1][0])).toEqual(
      expect.objectContaining(deepCopy(snapshot)),
    );

    client.emitter.emit('post.approved', {
      ...emptyPostPayload,
      posts: [approvedPost],
      feeds: [
        {
          ...postQueryResponsePage2.data.feeds[0],
          targetType: 'community',
          feedId,
          feedType: 'published',
        },
      ],
    });

    snapshot.data = payload.filter(({ postId }) => postId !== approvedPost.postId);

    expect(deepCopy(callback.mock.calls[2][0])).toEqual(
      expect.objectContaining(deepCopy(snapshot)),
    );
  });

  test('it should remove reviewing post when feedtype published', async () => {
    const feedId = 'publishedFeed';
    const approvedPost = { ...post14, feedId };

    const approvedFeed = {
      ...postQueryResponsePage2.data.feeds[0],
      feedType: 'published' as const,
    };

    postQueryResponsePage2.data.feeds = [approvedFeed];

    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(postQueryResponsePage2);

    getPosts(
      { ...params, targetType: 'community', feedType: 'published', includeDeleted: true },
      callback,
    );

    await pause();
    const payload = postQueryResponsePage2.data.posts;
    const snapshot = getSnapshot();

    snapshot.data = payload;
    snapshot.loading = false;

    expect(deepCopy(callback.mock.calls[1][0])).toEqual(
      expect.objectContaining(deepCopy(snapshot)),
    );

    client.emitter.emit('post.approved', {
      ...emptyPostPayload,
      posts: [approvedPost],
      feeds: [
        {
          ...postQueryResponsePage2.data.feeds[0],
          targetType: 'community',
          feedId,
          feedType: 'reviewing',
        },
      ],
    });

    snapshot.data = payload.filter(({ postId }) => postId !== approvedPost.postId);

    expect(deepCopy(callback.mock.calls[2][0])).toEqual(
      expect.objectContaining(deepCopy(snapshot)),
    );
  });
});
