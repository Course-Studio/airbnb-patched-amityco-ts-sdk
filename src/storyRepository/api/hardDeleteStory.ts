import { deleteStory } from '~/storyRepository/internalApi/deleteStory';

export const hardDeleteStory = async (storyId: Amity.Story['storyId']): Promise<boolean> => {
  const result = await deleteStory(storyId, true);
  return result;
};
