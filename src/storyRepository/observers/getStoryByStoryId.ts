import { liveObject } from '~/utils/liveObject';
import { onStoryError } from '~/storyRepository/events/onStoryError';
import { LinkedObject } from '~/utils/linkedObject';
import { onStoryDeleted, onStoryDeletedLocal } from '~/storyRepository/events/onStoryDeleted';
import {
  onStoryReactionAdded,
  onStoryReactionAddedLocal,
} from '~/storyRepository/events/onStoryReactionAdded';
import {
  onStoryReactionRemoved,
  onStoryReactionRemovedLocal,
} from '~/storyRepository/events/onStoryReactionRemoved';
import { onStoryUpdated, onStoryUpdatedLocal } from '~/storyRepository/events/onStoryUpdated';
import { getStoryByStoryId as _getStoryByStoryId } from '../internalApi/getStoryByStoryId';

const getSingleItemFromArray =
  (func: Amity.Subscriber<Amity.InternalStory[]>) =>
  (callback: Amity.Listener<Amity.InternalStory>) =>
    func((result: Amity.InternalStory[]) => callback(result[0]));

export const getStoryByStoryId = (
  storyId: Amity.Story['storyId'],
  callback: Amity.LiveObjectCallback<Amity.Story>,
): Amity.Unsubscriber => {
  return liveObject(
    storyId,
    data => {
      if (!data?.data) {
        callback(data);
        return;
      }

      callback({
        ...data,
        data: LinkedObject.story(data.data),
      });
    },
    'storyId',
    _getStoryByStoryId,
    [
      getSingleItemFromArray(onStoryUpdated),
      getSingleItemFromArray(onStoryDeleted),
      getSingleItemFromArray(onStoryReactionAdded),
      getSingleItemFromArray(onStoryReactionRemoved),
      getSingleItemFromArray(onStoryError),

      getSingleItemFromArray(onStoryUpdatedLocal),
      getSingleItemFromArray(onStoryDeletedLocal),
      getSingleItemFromArray(onStoryReactionAddedLocal),
      getSingleItemFromArray(onStoryReactionRemovedLocal),
    ],
  );
};
