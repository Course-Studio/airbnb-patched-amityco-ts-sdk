import { getActiveClient } from '~/client/api';
import { createEventSubscriber } from '~/core/events';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { convertRawStoryToInternal } from '~/storyRepository/utils/convertRawToStory';

export const onStoryDeleted = (callback: Amity.Listener<Amity.InternalStory[]>) => {
  const client = getActiveClient();

  const filter = async (payload: Amity.StoryPayload) => {
    const convertPayload = convertRawStoryToInternal(payload);
    ingestInCache(convertPayload);
    callback(convertPayload.stories);
  };

  const disposer = [createEventSubscriber(client, 'onStoryDeleted', 'story.deleted', filter)];

  return () => {
    disposer.forEach(fn => fn());
  };
};

export const onStoryDeletedLocal = (callback: Amity.Listener<Amity.InternalStory[]>) => {
  const client = getActiveClient();

  const filter = async (payload: Amity.StoryPayload) => {
    ingestInCache(payload);
    callback(payload.stories);
  };

  const disposer = [createEventSubscriber(client, 'onStoryDeleted', 'local.story.deleted', filter)];

  return () => {
    disposer.forEach(fn => fn());
  };
};
