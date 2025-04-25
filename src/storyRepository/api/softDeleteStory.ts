import { deleteStory } from '~/storyRepository/internalApi/deleteStory';

export const softDeleteStory = async (storyId: Amity.Story['storyId']): Promise<boolean> => {
  const result = await deleteStory(storyId);
  return result;
};
