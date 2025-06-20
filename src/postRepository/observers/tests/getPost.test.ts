import { disableCache, enableCache } from '~/cache/api';
import {
  client,
  connectClient,
  disconnectClient,
  emptyPostPayload,
  generatePost,
  pause,
  user12,
} from '~/utils/tests';
import { getFutureDate } from '~/core/model';

import { getPost } from '../getPost';

describe('getPost', () => {
  const post = generatePost();
  const response = {
    data: {
      ...emptyPostPayload,
      posts: [post],
    } as Amity.PostPayload,
  };

  beforeAll(async () => {
    await connectClient();
  });

  afterAll(async () => {
    await disconnectClient();
  });

  beforeEach(enableCache);

  afterEach(disableCache);

  const events: [string, keyof Amity.MqttPostEvents][] = [
    ['should get update on post.updated event', 'post.updated'],
    ['should get update on post.deleted event', 'post.deleted'],
    ['should get update on post.approved event', 'post.approved'],
    ['should get update on post.declined event', 'post.declined'],
    ['should get update on post.flagged event', 'post.flagged'],
    ['should get update on post.unflagged event', 'post.unflagged'],
  ];

  test.each(events)('%s', async (test, event) => {
    const update = {
      ...post,
      data: { text: 'new-text' },
      updatedAt: getFutureDate(post.updatedAt),
    };

    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(response);

    getPost(post.postId, callback);
    await pause();
    client.emitter.emit(event, { ...emptyPostPayload, posts: [update] });
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

  test.each([
    ['should get update on post.addReaction event', 'post.addReaction'],
    ['should get update on post.removeReaction event', 'post.removeReaction'],
  ] as [string, keyof Amity.MqttPostEvents][])('%s', async (test, event) => {
    const update = {
      ...post,
      data: { text: 'new-text' },
      updatedAt: getFutureDate(post.updatedAt),
    };
    const reactor: Amity.InternalReactor = {
      createdAt: getFutureDate(post.updatedAt),
      reactionId: 'like',
      reactionName: 'like',
      userId: user12.userId,
    };
    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(response);

    getPost(post.postId, callback);
    await pause();
    client.emitter.emit(event, { ...emptyPostPayload, posts: [update], reactor });
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
});
