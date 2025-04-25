import { disableCache, enableCache } from '~/cache/api';
import {
  client,
  communityUser11,
  connectClient,
  disconnectClient,
  generateComment,
  generateInternalComment,
  pause,
  user11,
  user12,
} from '~/utils/tests';
import { getFutureDate } from '~/core/model';

import { LinkedObject } from '~/utils/linkedObject';
import { getComment } from '../getComment';

describe('getComment', () => {
  const response = {
    data: {
      comments: [generateInternalComment()],
      communityUsers: [communityUser11],
      users: [user11],
    },
  };

  beforeAll(async () => {
    await connectClient();
  });

  afterAll(async () => {
    await disconnectClient();
  });

  beforeEach(enableCache);
  afterEach(disableCache);

  const events: [string, keyof Amity.MqttCommentEvents][] = [
    ['should get update on comment.updated event', 'comment.updated'],
    ['should get update on comment.deleted event', 'comment.deleted'],
    ['should get update on comment.flagged event', 'comment.flagged'],
    ['should get update on comment.unflagged event', 'comment.unflagged'],
  ];

  test.each(events)('%s', async (test, event) => {
    const update = generateComment({
      data: { text: 'new-text' },
    });

    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(response);

    getComment(update.commentId, callback);
    await pause();

    client.emitter.emit(event, {
      comments: [update],
      commentChildren: [],
      communityUsers: [],
      users: [],
      files: [],
    });

    await pause();

    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        data: LinkedObject.comment(update),
        loading: false,
      }),
    );
  });

  test.each([
    ['should get update on comment.addReaction event', 'comment.addReaction'],
    ['should get update on comment.removeReaction event', 'comment.removeReaction'],
  ] as [string, keyof Amity.MqttCommentEvents][])('%s', async (test, event) => {
    const update = generateComment({
      data: { text: 'new-text' },
    });

    const reactor: Amity.InternalReactor = {
      createdAt: getFutureDate(update.updatedAt),
      reactionId: 'like',
      reactionName: 'like',
      userId: user12.userId,
    };

    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(response);

    getComment(update.commentId, callback);
    await pause();

    client.emitter.emit(event, {
      comments: [update],
      reactor,
      commentChildren: [],
      communityUsers: [],
      users: [],
      files: [],
    });

    await pause();

    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        data: LinkedObject.comment(update),
        loading: false,
      }),
    );
  });
});
