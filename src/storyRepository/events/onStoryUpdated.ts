import { getActiveClient } from '~/client/api';
import { createEventSubscriber } from '~/core/events';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { convertRawStoryToInternal } from '~/storyRepository/utils/convertRawToStory';

export const onStoryUpdated = (callback: Amity.Listener<Amity.InternalStory[]>) => {
  const client = getActiveClient();

  const filter = async (payload: Amity.StoryPayload) => {
    // Apply the necessary field for story payload
    const convertPayload = convertRawStoryToInternal(payload);
    ingestInCache(convertPayload);
    callback(convertPayload.stories);
  };

  const disposers = [createEventSubscriber(client, 'onStoryUpdated', 'story.updated', filter)];

  return () => {
    disposers.forEach(fn => fn());
  };
};

export const onStoryUpdatedLocal = (callback: Amity.Listener<Amity.InternalStory[]>) => {
  const client = getActiveClient();

  const filter = async (payload: Amity.StoryPayload) => {
    ingestInCache(payload);
    callback(payload.stories);
  };

  const disposers = [
    createEventSubscriber(client, 'onStoryUpdated', 'local.story.updated', filter),
  ];

  return () => {
    disposers.forEach(fn => fn());
  };
};
