import { pullFromCache, pushToCache } from '~/cache/api';
import { STORY_KEY_CACHE } from '~/storyRepository/constants';

export const updateLocalLastStoryExpires = (stories: Amity.InternalStory[]) => {
  stories.forEach(story => {
    const currentCache = pullFromCache<Amity.timestamp>([STORY_KEY_CACHE.EXPIRE, story.targetId]);

    const currentExpireAt = new Date(story.expiresAt || 0);
    const localExpireAt = new Date(currentCache?.data || 0);

    if (currentExpireAt < localExpireAt) return;

    pushToCache([STORY_KEY_CACHE.EXPIRE, story.targetId], currentExpireAt.toISOString());
  });
};
