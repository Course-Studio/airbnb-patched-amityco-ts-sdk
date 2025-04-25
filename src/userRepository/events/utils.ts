import { getActiveClient } from '~/client/api/activeClient';
import { createEventSubscriber } from '~/core/events';

import { ingestInCache } from '~/cache/api/ingestInCache';
import { prepareUserPayload } from '../utils/prepareUserPayload';

export const createUserEventSubscriber = (
  event: keyof Amity.MqttUserEvents,
  callback: Amity.Listener<Amity.InternalUser>,
) => {
  const client = getActiveClient();

  const filter = (data: Amity.UserPayload) => {
    const payload = prepareUserPayload(data);

    if (client.cache) {
      ingestInCache(payload);
    }

    callback(payload.users[0]);
  };

  return createEventSubscriber(client, event, event, filter);
};
