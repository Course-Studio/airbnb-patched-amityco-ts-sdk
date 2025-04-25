import { getActiveClient } from '~/client/api';
import { createEventSubscriber } from '~/core/events';
import { ingestInCache } from '~/cache/api/ingestInCache';

export const onStoryError = (callback: Amity.Listener<Amity.InternalStory[]>) => {
  const client = getActiveClient();

  const filter = async (payload: Amity.StoryPayload) => {
    ingestInCache(payload);
    callback(payload.stories);
  };

  return createEventSubscriber(client, 'onStoryError', 'local.story.error', filter);
};
