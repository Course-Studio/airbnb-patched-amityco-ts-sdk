import { getActiveClient } from '~/client';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { convertRawStoryToInternal } from '~/storyRepository/utils/convertRawToStory';
import { fireEvent } from '~/core/events';
import { pushToCache } from '~/cache/api';
import { STORY_KEY_CACHE } from '~/storyRepository/constants';

export const createStory = async (
  payload: Amity.StoryCreatePayload,
): Promise<Amity.Cached<Amity.InternalStory | undefined>> => {
  const client = getActiveClient();
  client.log('post/createStory', payload);

  const response = await client.http.post<Amity.StoryPayload>('/api/v4/stories', payload);

  const convertedResponse = convertRawStoryToInternal(response.data);

  if (client.cache) ingestInCache(convertedResponse);

  pushToCache([STORY_KEY_CACHE.SYNC_STATE, payload.targetId], Amity.SyncState.Synced);
  fireEvent('local.story.created', convertedResponse);

  const cachedAt = client.cache && Date.now();

  return {
    data: convertedResponse.stories.length > 0 ? convertedResponse.stories[0] : undefined,
    cachedAt,
  };
};
