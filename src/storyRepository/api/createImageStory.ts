import { uploadImage } from '~/fileRepository';
import { uuid } from '~/core/uuid';
import { fireEvent } from '~/core/events';
import { createOptimisticEvent } from '~/storyRepository/utils/createOptimisticEvent';
import { LinkedObject } from '~/utils/linkedObject';
import { pushToCache } from '~/cache/api';
import { STORY_KEY_CACHE } from '~/storyRepository/constants';
import { createStory } from '../internalApi/createStory';
import { createOptimisticTarget } from '../utils/createOptimisticTarget';

/**
 * ```js
 * import { StoryRepository } from '@amityco/ts-sdk'
 * StoryRepository.createImageStory('community', 'communityId', formData, metadata, imageDisplayMode, items)
 * ```
 *
 * Create a new image story
 * @param targetType The type of the target
 * @param targetId The id of the target
 * @param formData The form data
 * @param metadata The metadata
 * @param imageDisplayMode The image display mode
 * @param items The story items
 * @returns The created story
 */
export const createImageStory = async (
  targetType: Amity.InternalStory['targetType'],
  targetId: Amity.InternalStory['targetId'],
  formData: FormData,
  metadata: Amity.Metadata = {},
  imageDisplayMode: Amity.ImageDisplayMode = 'fit',
  items: Amity.StoryItem[] = [],
): Promise<Amity.Cached<Amity.Story | undefined>> => {
  if (!formData.getAll('files').length) {
    throw new Error('The formData object must have a `files` key.');
  }

  let payload: Amity.StoryCreatePayload = {
    data: {
      text: '', // Still not in used now
      fileId: undefined,
      fileData: null,
      imageDisplayMode,
    },
    syncState: Amity.SyncState.Syncing,
    referenceId: uuid(),
    dataType: Amity.StoryDataType.Image,
    items,
    targetType,
    targetId,
    metadata,
  };

  const date = new Date();
  pushToCache([STORY_KEY_CACHE.SYNC_STATE, targetId], Amity.SyncState.Syncing);

  // Update local story expires time
  pushToCache(
    [STORY_KEY_CACHE.EXPIRE, targetId],
    new Date(date.setFullYear(date.getFullYear() + 1)),
  );

  // Fire optimistic event
  createOptimisticEvent({ payload, formData }, optimisticData => {
    fireEvent('local.story.created', optimisticData);
  });

  try {
    const { data } = await uploadImage(formData);

    // @TODO: Need to implement retrying logic in a future
    if (data.length === 0) throw new Error('Failed to upload image');
    const { fileId } = data[0];

    payload = {
      ...payload,
      data: {
        ...payload.data,
        fileId,
      },
    };

    createOptimisticTarget({ targetId, targetType });

    // Fire optimistic event - update fileId
    createOptimisticEvent({ payload, formData }, optimisticData => {
      fireEvent('local.story.created', optimisticData);
    });

    const result = await createStory(payload);
    if (!result.data) return result;

    return {
      ...result,
      data: LinkedObject.story(result.data),
    };
  } catch (error) {
    pushToCache([STORY_KEY_CACHE.SYNC_STATE, targetId], Amity.SyncState.Error);

    // Fire optimistic event - failed to upload image
    createOptimisticEvent(
      { payload: { ...payload, syncState: Amity.SyncState.Error }, formData },
      optimisticData => {
        fireEvent('local.story.error', optimisticData);
      },
    );

    throw error;
  }
};
