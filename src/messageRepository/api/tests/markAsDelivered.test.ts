import { pullFromCache, enableCache, disableCache } from '~/cache/api';
import { getResolver } from '~/core/model';

import {
  client,
  connectClient,
  disconnectClient,
  generateFeedMarker,
  generateUserMarkerResponse,
  generateChannelMarker,
  generateSubChannelMarker,
  activeUser,
  generateUserMarker,
  generateChannelMarkerResponse,
  generateSubChannelMarkerResponse,
} from '~/utils/tests';

import { markAsDelivered } from '../markAsDelivered';

const { userId } = activeUser;
const entityId = 'feed1';
const feedId = 'sub-ch1';
const messageId = 'message1';

const userMarkersResponse = generateUserMarkerResponse({ userId });
const channelMarkersResponse = generateChannelMarkerResponse({ userId, entityId });
const subChannelMarkerResponse = generateSubChannelMarkerResponse({ userId, feedId, entityId });

const expectedUserMarker = generateUserMarker({ userId });
const expectedChannelMarker = generateChannelMarker({ userId, entityId });
const expectedSubChannelMarker = generateSubChannelMarker({ userId, feedId, entityId });
const expectedFeedMarker = generateFeedMarker({ feedId, entityId });

const resolvedPutValue = {
  data: {
    userMarkers: [userMarkersResponse],
    userEntityMarkers: [channelMarkersResponse],
    userFeedMarkers: [subChannelMarkerResponse],
    feedMarkers: [expectedFeedMarker],
  } as Amity.MarkDeliveredPayload,
};

describe('markAsDelivered', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  test('it should return `true`', async () => {
    client.http.put = jest.fn().mockResolvedValueOnce(resolvedPutValue);

    const recieved = await markAsDelivered(feedId, messageId);

    expect(recieved).toBe(true);
  });

  test('it should update cache', async () => {
    expect.assertions(4);
    enableCache();

    client.http.put = jest.fn().mockResolvedValueOnce(resolvedPutValue);

    await markAsDelivered(feedId, messageId);

    const recievedUserMarkerCache = pullFromCache(['userMarker', 'get', userId]);

    const recievedChannelMarkerCache = pullFromCache([
      'channelMarker',
      'get',
      getResolver('channelMarker')({ entityId, userId }),
    ]);

    const recievedSubChannelMarkerCache = pullFromCache([
      'subChannelMarker',
      'get',
      getResolver('subChannelMarker')({ entityId, feedId, userId }),
    ]);

    const recievedFeedMarkerCache = pullFromCache([
      'feedMarker',
      'get',
      getResolver('feedMarker')({ entityId, feedId }),
    ]);

    expect(recievedUserMarkerCache?.data).toStrictEqual(expectedUserMarker);
    expect(recievedChannelMarkerCache?.data).toStrictEqual(expectedChannelMarker);
    expect(recievedSubChannelMarkerCache?.data).toStrictEqual(expectedSubChannelMarker);
    expect(recievedFeedMarkerCache?.data).toStrictEqual(expectedFeedMarker);

    disableCache();
  });
});
