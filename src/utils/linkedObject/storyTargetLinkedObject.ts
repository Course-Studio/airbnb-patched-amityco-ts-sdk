import { StoryComputedValue } from '~/storyRepository/utils/StoryComputedValue';

export const storyTargetLinkedObject = (storyTarget: Amity.RawStoryTarget): Amity.StoryTarget => {
  const {
    targetType,
    targetId,
    lastStoryExpiresAt,
    lastStorySeenExpiresAt,
    targetUpdatedAt,
    localFilter,
  } = storyTarget;

  const computedValue = new StoryComputedValue(
    targetId,
    lastStoryExpiresAt,
    lastStorySeenExpiresAt,
  );

  return {
    targetType,
    targetId,
    lastStoryExpiresAt,
    updatedAt: targetUpdatedAt,

    // Additional data
    hasUnseen: computedValue.getHasUnseenFlag(),
    syncingStoriesCount: computedValue.syncingStoriesCount,
    failedStoriesCount: computedValue.failedStoriesCount,

    localFilter,
    localLastExpires: computedValue.localLastStoryExpires,
    localLastSeen: computedValue.localLastStorySeenExpiresAt,
    localSortingDate: computedValue.getLocalLastSortingDate(),
  };
};
