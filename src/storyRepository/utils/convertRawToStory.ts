// Due to we have optimistic logic, we will use referenceId as a id in SDK instead of storyId

export const applyMissingField = (
  rawData: Amity.RawStory,
  isCreated = false,
): Amity.InternalStory => {
  const { storyId, referenceId } = rawData;

  if (!isCreated) {
    if (referenceId) return { ...rawData, syncState: Amity.SyncState.Synced };
  }

  return { ...rawData, syncState: Amity.SyncState.Synced, referenceId: storyId };
};

export const convertRawStoryToInternal = (
  data: Amity.StoryPayload,
  isCreated = false,
): Amity.StoryWithOptimisticPayload => {
  const { stories } = data;
  const storiesData = stories.map(story => applyMissingField(story, isCreated));
  return { ...data, stories: storiesData };
};
