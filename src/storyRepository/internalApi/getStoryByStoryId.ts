import { getActiveClient } from '~/client';
import { pullFromCache } from '~/cache/api';
import { isInTombstone } from '~/cache/api/isInTombstone';
import { checkIfShouldGoesToTombstone } from '~/cache/utils';
import { pushToTombstone } from '~/cache/api/pushToTombstone';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { STORY_KEY_CACHE } from '~/storyRepository/constants';
import { convertRawStoryToInternal } from '~/storyRepository/utils/convertRawToStory';

export const getStoryByStoryId = async (
  storyId: Amity.Story['storyId'],
): Promise<Amity.Cached<Amity.RawStory>> => {
  const client = getActiveClient();
  client.log('story/getStoryByStoryId', storyId);

  // Get story referenceId from cache
  const cacheReferenceId = pullFromCache<Amity.Story['referenceId']>([
    STORY_KEY_CACHE.STORY_ID_TO_REFERENCE_ID,
    storyId,
  ]);
  if (cacheReferenceId?.data) {
    const { data: referenceId } = cacheReferenceId;
    isInTombstone('story', referenceId);
  }

  let data: Amity.StoryPayload;

  try {
    const response = await client.http.get<Amity.StoryPayload>(`/api/v4/stories/${storyId}`);
    data = convertRawStoryToInternal(response.data);
  } catch (error) {
    if (checkIfShouldGoesToTombstone((error as Amity.ErrorResponse)?.code)) {
      pushToTombstone('story', storyId);
    }

    throw error;
  }

  const cachedAt = client.cache && Date.now();
  if (client.cache) {
    ingestInCache(data, { cachedAt });
  }

  return {
    data: data.stories[0],
    cachedAt,
  };
};

getStoryByStoryId.locally = (
  storyId: Amity.Story['storyId'],
): Amity.Cached<Amity.InternalStory> | undefined => {
  const client = getActiveClient();
  client.log('story/getStorybyStoryId', storyId);

  // Get story referenceId from cache
  const cacheReferenceId = pullFromCache<Amity.Story['referenceId']>([
    STORY_KEY_CACHE.STORY_ID_TO_REFERENCE_ID,
    storyId,
  ]);
  if (cacheReferenceId?.data) {
    const { data: referenceId } = cacheReferenceId;
    isInTombstone('story', referenceId);
  }

  const cachedAt = client.cache && Date.now();
  const storyCache = pullFromCache<Amity.InternalStory>(['story', 'get', storyId]);

  if (!storyCache) return;

  return {
    data: storyCache.data,
    cachedAt,
  };
};
