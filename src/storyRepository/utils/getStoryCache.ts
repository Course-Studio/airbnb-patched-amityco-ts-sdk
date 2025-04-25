import { pullFromCache } from '~/cache/api';

export const getStoryCache = (storyId: Amity.Story['storyId'] | undefined) => {
  if (!storyId) return { data: undefined, cachedAt: undefined };
  return pullFromCache<Amity.InternalStory>(['story', 'get', storyId]);
};
