import { getActiveClient } from '~/client/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { createEventSubscriber } from '~/core/events';
import { pullFromCache } from '~/cache/api';

import { prepareCommunityPayload } from '../utils';

export const createCommunityEventSubscriber = (
  event: keyof Amity.MqttCommunityEvents,
  callback: Amity.Listener<Amity.Community>,
) => {
  const client = getActiveClient();

  const filter = (payload: Amity.CommunityPayload) => {
    const unpackedPayload = prepareCommunityPayload(payload);

    if (!client.cache) {
      // TODO: here we are missing specific properties here!
      callback(unpackedPayload.communities[0]);
    } else {
      ingestInCache(unpackedPayload);

      const community = pullFromCache<Amity.Community>([
        'community',
        'get',
        unpackedPayload.communities[0].communityId,
      ])!;

      callback(community.data);
    }
  };

  return createEventSubscriber(client, event, event, filter);
};
