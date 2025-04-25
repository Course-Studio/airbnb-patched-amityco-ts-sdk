import { getActiveClient } from '~/client/api';
import { createEventSubscriber } from '~/core/events';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { convertRawStoryToInternal } from '~/storyRepository/utils/convertRawToStory';

export const onStoryCreated = (callback: Amity.Listener<Amity.InternalStory[]>) => {
  const client = getActiveClient();

  const filter = async (payload: Amity.StoryPayload) => {
    // Apply the necessary field for story payload
    const convertPayload = convertRawStoryToInternal(payload, true);
    ingestInCache(convertPayload);
    callback(convertPayload.stories);
  };

  const disposers = [createEventSubscriber(client, 'onStoryCreated', 'story.created', filter)];

  return () => {
    disposers.forEach(fn => fn());
  };
};

export const onStoryCreatedLocal = (callback: Amity.Listener<Amity.InternalStory[]>) => {
  const client = getActiveClient();

  const filter = async (payload: Amity.StoryPayload) => {
    ingestInCache(payload);
    callback(payload.stories);
  };

  const disposers = [
    createEventSubscriber(client, 'onStoryCreated', 'local.story.created', filter),
  ];

  return () => {
    disposers.forEach(fn => fn());
  };
};
