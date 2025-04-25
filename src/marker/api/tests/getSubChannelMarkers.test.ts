import { disableCache, enableCache, pullFromCache } from '~/cache/api';
import { ASCApiError } from '~/core/errors';
import { getResolver } from '~/core/model';
import { onSubChannelMarkerFetched, onUserMarkerFetched } from '~/marker/events';
import {
  client,
  generateChannelMarker,
  generateChannelMarkerResponse,
  generateFeedMarkerResponse,
  generateSubChannelMarker,
  generateSubChannelMarkerResponse,
  generateUserMarker,
  generateUserMarkerResponse,
} from '~/utils/tests';

import { getSubChannelMarkers } from '../getSubChannelMarkers';

const pagingToken = {
  previous: 'eyJiZWZvcmUiOjU1LCJsYXN0IjoxMH0=',
  next: 'eyJiZWZvcmUiOjU1LCJsYXN0IjoxMH0=',
};

const pagingCriteria = { limit: 10 };
const subChannelMarkerResponse = [
  generateSubChannelMarkerResponse({ feedId: 'sub-ch1', entityId: 'ch1' }),
  generateSubChannelMarkerResponse({ feedId: 'sub-ch2', entityId: 'ch1' }),
];
const channelMarkersResponse = [
  generateChannelMarkerResponse({ entityId: 'ch1', userId: 'user1' }),
];
const userMarkersResponse = [generateUserMarkerResponse({ userId: 'currentUser1' })];

const feedMarkerResponse = [
  generateFeedMarkerResponse({ feedId: 'sub-ch1', entityId: 'ch1' }),
  generateFeedMarkerResponse({ feedId: 'sub-ch2', entityId: 'ch1' }),
];

const expectedSubChannelMarkers = [
  generateSubChannelMarker({ feedId: 'sub-ch1', entityId: 'ch1' }),
  generateSubChannelMarker({ feedId: 'sub-ch2', entityId: 'ch1' }),
];
const expectedUserMarkers = [generateUserMarker({ userId: 'currentUser1' })];

const subChannelIds = expectedSubChannelMarkers.map(({ feedId }) => feedId);
const subChannelMarkerResolver = getResolver('subChannelMarker');
const subChannelMarkerCacheIds = expectedSubChannelMarkers.map(subChannelMarkerResolver);

const resolvedGetValue = {
  data: {
    feedMarkers: feedMarkerResponse,
    userFeedMarkers: subChannelMarkerResponse,
    userEntityMarkers: channelMarkersResponse,
    userMarkers: userMarkersResponse,
    paging: pagingToken,
  } as Amity.SubChannelMarkerPayload,
};

describe('getSubChannelMarkers', () => {
  it('should return sub channel markers', async () => {
    client.http.get = jest.fn().mockResolvedValue(resolvedGetValue);

    const { data } = await getSubChannelMarkers(subChannelIds);

    expect(data).toEqual(expectedSubChannelMarkers);
  });

  test('should return fetched sub channel markers with correct paging', async () => {
    client.http.get = jest.fn().mockResolvedValueOnce(resolvedGetValue);

    await expect(getSubChannelMarkers(subChannelIds, pagingCriteria)).resolves.toEqual(
      expect.objectContaining({
        data: expectedSubChannelMarkers,
        prevPage: { before: 55, limit: 10 },
        nextPage: { before: 55, limit: 10 },
      }),
    );
  });

  test('should update cache after fetching sub channel markers ', async () => {
    enableCache();

    client.http.get = jest.fn().mockResolvedValue(resolvedGetValue);

    await getSubChannelMarkers(subChannelIds);
    const received = subChannelMarkerCacheIds.map(
      id => pullFromCache(['subChannelMarker', 'get', id])?.data,
    );

    expect(received).toEqual(expectedSubChannelMarkers);

    disableCache();
  });

  test('should throw an error if request fails', async () => {
    client.http.get = jest
      .fn()
      .mockRejectedValueOnce(
        new ASCApiError('Not Found', Amity.ServerError.ITEM_NOT_FOUND, Amity.ErrorLevel.ERROR),
      );

    await expect(getSubChannelMarkers(subChannelIds)).rejects.toThrow(
      'Amity SDK (400400): Not Found',
    );
  });

  test('should fire event `onSubChannelMarkerFetched`', async () => {
    let dispose;
    client.http.get = jest.fn().mockResolvedValue(resolvedGetValue);

    const callbackPromise = new Promise(resolve => {
      dispose = onSubChannelMarkerFetched(resolve);
    }).finally(dispose);

    await getSubChannelMarkers(subChannelIds);

    await expect(callbackPromise).resolves.toMatchObject(expectedSubChannelMarkers[0]);
  });

  test('should fire event `onUserMarkerFetched`', async () => {
    let dispose;
    client.http.get = jest.fn().mockResolvedValue(resolvedGetValue); // isMentioned

    const callbackPromise = new Promise(resolve => {
      dispose = onUserMarkerFetched(resolve);
    }).finally(dispose); // hasMentioned

    await getSubChannelMarkers(subChannelIds);

    await expect(callbackPromise).resolves.toMatchObject(expectedUserMarkers[0]);
  });
});
