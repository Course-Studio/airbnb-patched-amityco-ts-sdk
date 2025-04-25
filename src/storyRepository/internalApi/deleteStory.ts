import { getActiveClient } from '~/client';
import { fireEvent } from '~/core/events';
import { getStoryCache } from '../utils/getStoryCache';
import { dropFromCache, pullFromCache, pushToCache, queryCache } from '~/cache/api';
import { STORY_KEY_CACHE } from '../constants';

export const deleteStory = async (
  storyId: Amity.Story['storyId'],
  permanent = false,
): Promise<boolean> => {
  const client = getActiveClient();
  client.log('story/deleteStory', storyId);

  let cached;

  if (client.cache) {
    cached = getStoryCache(storyId);
    if (cached?.data) {
      const { data } = cached;
      fireEvent('local.story.deleted', {
        categories: [],
        comments: [],
        communities: [],
        communityUsers: [],
        files: [],
        users: [],
        stories: [{ ...data, isDeleted: true }],
      });

      /* ------ Unsynced story case ------ */
      if (data.syncState !== Amity.SyncState.Synced) {
        if (permanent) {
          dropFromCache([STORY_KEY_CACHE.STORY, 'get', storyId]);
        } else {
          pushToCache([STORY_KEY_CACHE.STORY, 'get', storyId], { ...cached.data, isDeleted: true });
        }

        const unsyncedStoriesCache = queryCache<Amity.InternalStory>([
          STORY_KEY_CACHE.STORY,
          'get',
        ])?.filter(
          story =>
            story.data.syncState !== Amity.SyncState.Synced &&
            story.data.targetId === data.targetId &&
            story.data.isDeleted !== true,
        );

        // update localLastStoryExpiresAt to be the last story expires

        if (unsyncedStoriesCache && unsyncedStoriesCache.length > 0) {
          const lastStoryExpires = unsyncedStoriesCache.reduce((acc, story) => {
            const expireAt = new Date(story.data.expiresAt || 0);
            return expireAt > acc ? expireAt : acc;
          }, new Date(0));

          pushToCache(
            [STORY_KEY_CACHE.EXPIRE, cached.data.targetId],
            lastStoryExpires.toISOString(),
          );
        } else {
          // if no unsynced stories, remove last story expires since there is no more story
          dropFromCache([STORY_KEY_CACHE.EXPIRE, cached.data.targetId]);
        }

        return true;
      }

      /* ------ Synced story case ------ */
      const targetCache = pullFromCache<Amity.RawStoryTarget>([
        STORY_KEY_CACHE.STORY_TARGET,
        'get',
        data.targetId,
      ])?.data;

      const syncedStoriesCache = queryCache<Amity.InternalStory>([
        STORY_KEY_CACHE.STORY,
        'get',
      ])?.filter(
        story =>
          story.data.syncState === Amity.SyncState.Synced &&
          story.data.targetId === data.targetId &&
          story.data.isDeleted !== true,
      );

      let lastStoryExpiresAt;

      if (syncedStoriesCache && syncedStoriesCache.length > 0) {
        lastStoryExpiresAt = syncedStoriesCache?.reduce((acc, story) => {
          const expireAt = new Date(story.data.expiresAt || 0);
          return expireAt > acc ? expireAt : acc;
        }, new Date(0));
      }

      // update lastStoryExpiresAt from lastest synced story
      if (targetCache) {
        pushToCache([STORY_KEY_CACHE.STORY_TARGET, 'get', data.targetId], {
          ...targetCache,
          lastStoryExpiresAt,
        });
      }
    }
  }

  const response = await client.http.delete(`/api/v4/stories/${storyId}`, {
    params: { permanent },
  });

  return response.data.success;
};
