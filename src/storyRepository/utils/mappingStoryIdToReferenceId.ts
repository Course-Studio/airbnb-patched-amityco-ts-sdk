import { pushToCache } from '~/cache/api';
import { STORY_KEY_CACHE } from '~/storyRepository/constants';

export const mappingStoryIdToReferenceId = (stories: Amity.InternalStory[]) => {
  stories.forEach(story => {
    pushToCache([STORY_KEY_CACHE.STORY_ID_TO_REFERENCE_ID, story.storyId], story.referenceId);
  });
};
