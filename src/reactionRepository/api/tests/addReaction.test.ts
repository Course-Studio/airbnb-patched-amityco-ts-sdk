import { ASCApiError } from '~/core/errors';
import { disableCache, enableCache, pullFromCache, pushToCache } from '~/cache/api';

import { onMessageUpdated } from '~/messageRepository/events';
import { addReaction } from '~/reactionRepository/api';

import { client, message11 as message, pause } from '~/utils/tests';
import { UNSYNCED_OBJECT_CACHED_AT_VALUE } from '~/utils/constants';

const cacheKey = ['message', 'get', message.messageId];

describe('addReaction', () => {
  // integration_test_id: 6252e6ed-afd7-460f-a285-f95650ec513a
  test('it should add a reaction', async () => {
    client.http.post = jest.fn().mockResolvedValue({ data: { addedId: 'reactionId' } });

    const success = await addReaction('message', message.messageId, 'like');

    expect(success).toEqual(true);
  });

  // integration_test_id: ddc6da15-cfa3-4f54-ad52-be50c2841d6e
  test('it should throw 400400 when resource not found', async () => {
    client.http.post = jest
      .fn()
      .mockRejectedValueOnce(
        new ASCApiError('not found!', Amity.ServerError.ITEM_NOT_FOUND, Amity.ErrorLevel.ERROR),
      );

    await expect(addReaction('message', message.messageId, 'like')).rejects.toThrow();
  });

  test('it should update cache after adding reaction', async () => {
    enableCache();

    pushToCache(cacheKey, message);
    client.http.post = jest.fn().mockResolvedValue({ data: { addedId: 'reactionId' } });

    const success = await addReaction('message', message.messageId, 'like');

    expect(success).toEqual(true);
    expect(pullFromCache(cacheKey)?.cachedAt).toBeDefined();
    expect(pullFromCache(cacheKey)?.cachedAt).not.toBe(UNSYNCED_OBJECT_CACHED_AT_VALUE);
    expect(pullFromCache(cacheKey)?.cachedAt).not.toBe(-1);

    disableCache();
  });
});

describe('addReaction > optimistically', () => {
  beforeEach(enableCache);

  afterEach(disableCache);

  test('it should return undefined if cache disabled', () => {
    disableCache();

    expect(addReaction.optimistically('message', message.messageId, 'like')).toBeUndefined();
  });

  test('it should optimistically add a reaction', async () => {
    const callback = jest.fn();
    pushToCache(cacheKey, message);
    onMessageUpdated(callback);

    const success = addReaction.optimistically('message', message.messageId, 'like');

    expect(success).toEqual(true);
    expect(pullFromCache(cacheKey)?.data).toMatchObject({
      myReactions: ['like'],
      reactions: { like: 1 },
      reactionsCount: 1,
    });
    await pause();
    expect(callback).toBeCalledTimes(1);
  });

  test('it should mark optimistic object as unsynced', async () => {
    pushToCache(cacheKey, message);

    const success = addReaction.optimistically('message', message.messageId, 'like');

    expect(success).toEqual(true);
    expect(pullFromCache(cacheKey)?.cachedAt).toBe(UNSYNCED_OBJECT_CACHED_AT_VALUE);
  });
});
