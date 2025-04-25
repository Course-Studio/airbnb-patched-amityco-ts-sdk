import { getActiveClient } from '~/client/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { createEventSubscriber } from '~/core/events';
import { queryCache, upsertInCache } from '~/cache/api';
import { prepareFollowersPayload, prepareFollowStatusPayload } from '../utils';

export const createFollowEventSubscriber = (
  event: keyof Amity.MqttFollowEvents,
  callback: Amity.Listener<Amity.InternalFollowStatus>,
) => {
  const client = getActiveClient();

  const filter = (data: Amity.FollowersPayload) => {
    const payload = prepareFollowersPayload(data);

    if (!client.cache) {
      callback(payload.follows[0]);
    } else {
      ingestInCache(payload);

      callback(payload.follows[0]);
    }
  };

  return createEventSubscriber(client, event, event, filter);
};

export const createLocalFollowEventSubscriber = (
  event: keyof Amity.LocalFollowEvents,
  callback: Amity.Listener<Amity.InternalFollowStatus>,
) => {
  const client = getActiveClient();

  const filter = (data: Amity.FollowStatusPayload) => {
    const payload = prepareFollowStatusPayload(data);

    if (!client.cache) {
      callback(payload.follows[0]);
    } else {
      ingestInCache(payload);

      callback(payload.follows[0]);
    }
  };

  return createEventSubscriber(client, event, event, filter);
};
