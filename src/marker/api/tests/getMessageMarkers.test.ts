import { disableCache, enableCache, pullFromCache } from '~/cache/api';
import { ASCApiError } from '~/core/errors';
import { getResolver } from '~/core/model';
import { onMessageMarkerFetched, onUserMarkerFetched } from '~/marker/events';
import {
  client,
  generateFeedMarker,
  generateMessageMarker,
  generateUserMarker,
  generateUserMarkerResponse,
} from '~/utils/tests';

import { getMessageMarkers } from '../getMessageMarkers';

const expectedMessageMarkers = [
  generateMessageMarker({ feedId: 'sub-ch1', contentId: 'message1' }),
  generateMessageMarker({ feedId: 'sub-ch1', contentId: 'message2' }),
];

const expectedFeedMarkers = [generateFeedMarker({ feedId: 'sub-ch1', entityId: 'feed1' })];

const userMarkersResponse = [generateUserMarkerResponse({ userId: 'currentUser1' })];
const expectedUserMarkers = [generateUserMarker({ userId: 'currentUser1' })];

const messageIds = expectedMessageMarkers.map(({ contentId }) => contentId);
const messageMarkerResolver = getResolver('messageMarker');
const messageMarkerCacheIds = expectedMessageMarkers.map(messageMarkerResolver);

const resolvedGetValue = {
  data: {
    contentMarkers: expectedMessageMarkers,
    feedMarkers: expectedFeedMarkers,
    userMarkers: userMarkersResponse,
  } as Amity.MessageMarkerPayload,
};

describe('getMessageMarkers', () => {
  it('should return message markers', async () => {
    client.http.get = jest.fn().mockResolvedValue(resolvedGetValue);

    const { data } = await getMessageMarkers(messageIds);

    expect(data).toEqual(expectedMessageMarkers);
  });

  test('should return fetched message markers with correct paging', async () => {
    client.http.get = jest.fn().mockResolvedValueOnce(resolvedGetValue);

    await expect(getMessageMarkers(messageIds)).resolves.toEqual(
      expect.objectContaining({
        data: expectedMessageMarkers,
      }),
    );
  });

  test('should update cache after fetching message markers ', async () => {
    enableCache();

    client.http.get = jest.fn().mockResolvedValue(resolvedGetValue);

    await getMessageMarkers(messageIds);
    const received = messageMarkerCacheIds.map(
      id => pullFromCache(['messageMarker', 'get', id])?.data,
    );

    expect(received).toEqual(expectedMessageMarkers);

    disableCache();
  });

  test('should throw an error if request fails', async () => {
    client.http.get = jest
      .fn()
      .mockRejectedValueOnce(
        new ASCApiError('Not Found', Amity.ServerError.ITEM_NOT_FOUND, Amity.ErrorLevel.ERROR),
      );

    await expect(getMessageMarkers(messageIds)).rejects.toThrow('Amity SDK (400400): Not Found');
  });

  test('should fire event `onMessageMarkerFetched`', async () => {
    let dispose;
    client.http.get = jest.fn().mockResolvedValue(resolvedGetValue);

    const callbackPromise = new Promise(resolve => {
      dispose = onMessageMarkerFetched(resolve);
    }).finally(dispose);

    await getMessageMarkers(messageIds);

    await expect(callbackPromise).resolves.toMatchObject(expectedMessageMarkers[0]);
  });

  test('should fire event `onUserMarkerFetched`', async () => {
    let dispose;
    client.http.get = jest.fn().mockResolvedValue(resolvedGetValue);

    const callbackPromise = new Promise(resolve => {
      dispose = onUserMarkerFetched(resolve);
    }).finally(dispose);

    await getMessageMarkers(messageIds);

    await expect(callbackPromise).resolves.toMatchObject(expectedUserMarkers[0]);
  });
});
