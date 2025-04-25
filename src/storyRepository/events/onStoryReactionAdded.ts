import { getActiveClient } from '~/client/api';
import { createEventSubscriber } from '~/core/events';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { convertRawStoryToInternal } from '~/storyRepository/utils/convertRawToStory';
import { prepareStoryReactionPayloadFormEvent } from '~/reactionRepository/utils';

export const onStoryReactionAdded = (callback: Amity.Listener<Amity.InternalStory[]>) => {
  const client = getActiveClient();

  const filter = async (payload: Amity.Events['story.reactionAdded']) => {
    const { reactions, ...rest } = payload;
    const internalStory = convertRawStoryToInternal(rest);
    const convertedPayload = prepareStoryReactionPayloadFormEvent('story.reactionAdded', {
      ...internalStory,
      reactions,
    });
    ingestInCache(convertedPayload);
    callback(convertedPayload.stories);
  };

  const disposers = [
    createEventSubscriber(client, 'onStoryReactionAdded', 'story.reactionAdded', filter),
  ];

  return () => {
    disposers.forEach(fn => fn());
  };
};

export const onStoryReactionAddedLocal = (callback: Amity.Listener<Amity.InternalStory[]>) => {
  const client = getActiveClient();

  const filter = async (payload: Amity.LocalEvents['local.story.reactionAdded']) => {
    ingestInCache({ stories: [payload.story] });
    callback([payload.story]);
  };

  const disposers = [
    createEventSubscriber(client, 'onStoryReactionAdded', 'local.story.reactionAdded', filter),
  ];

  return () => {
    disposers.forEach(fn => fn());
  };
};
