import { getActiveClient } from '~/client';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { convertRawStoryToInternal } from '~/storyRepository/utils/convertRawToStory';
import { updateLocalLastStoryExpires } from '~/storyRepository/utils/updateLocalLastStoryExpires';
import { mappingStoryIdToReferenceId } from '~/storyRepository/utils/mappingStoryIdToReferenceId';

export const getActiveStoriesByTarget = async ({
  targetType,
  targetId,
  options,
}: Amity.GetStoriesByTargetParam): Promise<Amity.Cached<Amity.PageToken<Amity.InternalStory>>> => {
  const client = getActiveClient();
  client.log('story/getActiveStoriesByTarget');
  const cachedAt = client.cache && Date.now();

  const response = await client.http.get<Amity.StoryPayload>('/api/v4/stories', {
    params: {
      targetType,
      targetId,
      options: {
        sortBy: options?.sortBy || 'createdAt',
        orderBy: options?.orderBy || 'desc',
      },
    },
  });

  const convertedData: Amity.StoryPayload = convertRawStoryToInternal(response.data);

  if (client.cache) {
    ingestInCache(convertedData);

    // Update local last story expires
    updateLocalLastStoryExpires(convertedData.stories);

    // Map storyId to referenceId
    mappingStoryIdToReferenceId(convertedData.stories);
  }

  return {
    data: convertedData.stories,
    cachedAt,
    paging: { next: undefined, previous: undefined }, // Disable pagination for this API
  };
};
