import { getActiveClient } from '~/client';
import { ingestInCache } from '~/cache/api/ingestInCache';

export const getTargetsByTargetIds = async (
  targets: Amity.StoryTargetQueryParam[],
): Promise<Amity.Cached<Amity.RawStoryTarget[]>> => {
  const client = getActiveClient();
  client.log('story/getTargetsByTargetIds', targets);

  const response = await client.http.get<Amity.StoryTargetPayload>('/api/v4/stories/seen', {
    params: { targets },
  });

  const { data } = response;

  if (client.cache) ingestInCache(response.data);

  return {
    data: data.storyTargets,
    cachedAt: Date.now(),
  };
};
