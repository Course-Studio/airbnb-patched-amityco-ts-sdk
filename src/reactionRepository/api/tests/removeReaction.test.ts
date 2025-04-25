import { ASCApiError } from '~/core/errors';
import { disableCache, enableCache, pullFromCache, pushToCache } from '~/cache/api';

import { onMessageUpdated } from '~/messageRepository/events';
import { removeReaction } from '~/reactionRepository/api';

import { UNSYNCED_OBJECT_CACHED_AT_VALUE } from '~/utils/constants';
import { client, message11, pause } from '~/utils/tests';

const message = {
  ...message11,
  myReactions: ['like'],
  reactions: { like: 1 },
  reactionsCount: 1,
};
const cacheKey = ['message', 'get', message.messageId];

describe('removeReaction', () => {
  // integration_test_id: dda62dbf-7649-4f1e-b264-0f79984ae1c8
  test('it should remove a reaction', async () => {
    client.http.delete = jest.fn().mockResolvedValue({ data: { removedId: 'reactionId' } });

    const success = await removeReaction('message', message.messageId, 'like');

    expect(success).toEqual(true);
  });

  // integration_test_id: b5ab2716-044c-488a-839e-4a7517e58ca9
  test('it should throw 400400 when resource not found', async () => {
    client.http.delete = jest
      .fn()
      .mockRejectedValueOnce(
        new ASCApiError('not found!', Amity.ServerError.ITEM_NOT_FOUND, Amity.ErrorLevel.ERROR),
      );

    await expect(removeReaction('message', message.messageId, 'like')).rejects.toThrow();
  });

  test('it should update cache after adding reaction', async () => {
    enableCache();

    pushToCache(cacheKey, message);
    client.http.post = jest.fn().mockResolvedValue({ data: { addedId: 'reactionId' } });

    const success = await removeReaction('message', message.messageId, 'like');

    expect(success).toEqual(true);
    expect(pullFromCache(cacheKey)?.cachedAt).toBeDefined();
    expect(pullFromCache(cacheKey)?.cachedAt).not.toBe(UNSYNCED_OBJECT_CACHED_AT_VALUE);
    expect(pullFromCache(cacheKey)?.cachedAt).not.toBe(-1);

    disableCache();
  });
});

describe('removeReaction > optimistically', () => {
  beforeEach(enableCache);

  afterEach(disableCache);

  test('it should return undefined if cache disabled', () => {
    disableCache();

    expect(removeReaction.optimistically('message', message.messageId, 'like')).toBeUndefined();
  });

  test('it should optimistically remove a reaction', async () => {
    const callback = jest.fn();
    pushToCache(cacheKey, message);
    onMessageUpdated(callback);

    const success = removeReaction.optimistically('message', message.messageId, 'like');

    expect(success).toEqual(true);
    expect(pullFromCache(cacheKey)?.data).toMatchObject({
      myReactions: [],
      reactions: { like: 0 },
      reactionsCount: 0,
    });
    await pause();
    expect(callback).toBeCalledTimes(1);
  });

  test('it should mark optimistic object as unsynced', async () => {
    pushToCache(cacheKey, message);

    const success = removeReaction.optimistically('message', message.messageId, 'like');

    expect(success).toEqual(true);
    expect(pullFromCache(cacheKey)?.cachedAt).toBe(UNSYNCED_OBJECT_CACHED_AT_VALUE);
  });
});
