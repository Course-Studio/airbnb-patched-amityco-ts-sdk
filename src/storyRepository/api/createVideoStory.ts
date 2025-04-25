import { uploadVideo } from '~/fileRepository';
import { uuid } from '~/core/uuid';
import { fireEvent } from '~/core/events';
import { createOptimisticEvent } from '~/storyRepository/utils/createOptimisticEvent';
import { ContentFeedType } from '~/@types';
import { LinkedObject } from '~/utils/linkedObject';
import { pushToCache } from '~/cache/api';
import { STORY_KEY_CACHE } from '~/storyRepository/constants';
import { createStory } from '../internalApi/createStory';
import { createOptimisticTarget } from '../utils/createOptimisticTarget';

/**
 * ```js
 * import { StoryRepository } from '@amityco/ts-sdk'
 * StoryRepository.createVideoStory('community', 'communityId', formData, metadata, items)
 * ```
 *
 * Create a new video story
 * @param targetType
 * @param targetId
 * @param formData
 * @param metadata
 * @param items
 */

export const createVideoStory = async (
  targetType: Amity.InternalStory['targetType'],
  targetId: Amity.InternalStory['targetId'],
  formData: FormData,
  metadata: Amity.Metadata = {},
  items: Amity.StoryItem[] = [],
): Promise<Amity.Cached<Amity.Story | undefined>> => {
  if (!formData.getAll('files').length)
    throw new Error('The formData object must have a `files` key.');

  let payload: Amity.StoryCreatePayload = {
    data: {
      text: '', // Still not in used now
      fileId: undefined,
      fileData: null,
    },
    syncState: Amity.SyncState.Syncing,
    referenceId: uuid(),
    dataType: Amity.StoryDataType.Video,
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

  createOptimisticTarget({ targetId, targetType });

  // Fire optimistic event
  createOptimisticEvent({ payload, formData, isVideo: true }, optimisticData => {
    fireEvent('local.story.created', optimisticData);
  });

  try {
    const { data } = await uploadVideo(formData, ContentFeedType.STORY);

    // @TODO: Need to implement retrying logic in a future
    if (data.length === 0) throw new Error('Failed to upload video');
    const { fileId } = data[0];

    payload = {
      ...payload,
      data: {
        ...payload.data,
        fileId,
        videoFileId: { original: fileId },
      },
    };

    // Fire optimistic event - update fileId
    createOptimisticEvent({ payload, formData, isVideo: true }, optimisticData => {
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

    // Fire optimistic upload failed
    createOptimisticEvent(
      { payload: { ...payload, syncState: Amity.SyncState.Error }, formData, isVideo: true },
      optimisticData => {
        fireEvent('local.story.error', optimisticData);
      },
    );

    throw error;
  }
};
