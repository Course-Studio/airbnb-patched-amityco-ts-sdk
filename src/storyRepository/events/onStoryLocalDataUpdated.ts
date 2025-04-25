import { getActiveClient } from '~/client/api';
import { createEventSubscriber } from '~/core/events';

export const onStoryLocalDataUpdated = (
  callback: Amity.Listener<{ referenceIds: Amity.Story['referenceId'][] }>,
) => {
  const client = getActiveClient();

  const filter = (payload: { referenceIds: Amity.Story['referenceId'][] }) => {
    callback(payload);
  };

  return createEventSubscriber(client, 'onStoryLocalDataUpdated', 'local.story.reload', filter);
};
