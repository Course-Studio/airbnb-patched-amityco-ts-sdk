import { disableCache, enableCache, pullFromCache } from '~/cache/api';
import { ASCApiError } from '~/core/errors';
import { getResolver } from '~/core/model';
import { onUserMarkerFetched } from '~/marker/events';
import { onChannelMarkerFetched } from '~/marker/events/onChannelMarkerFetched';
import { client, generateChannelMarker, generateUserMarker } from '~/utils/tests';

import { getChannelMarkers } from '../getChannelMarkers';

const userId = 'user1';

const expectedChannelMarkers = [
  generateChannelMarker({ entityId: 'ch1', userId }),
  generateChannelMarker({ entityId: 'ch2', userId }),
];

const expectedUserMarkers = [generateUserMarker({ userId: 'currentUser1' })];

const channelIds = expectedChannelMarkers.map(({ entityId }) => entityId);

const resolvedGetValue = {
  data: {
    userEntityMarkers: expectedChannelMarkers,
    userMarkers: expectedUserMarkers,
  },
};

describe('getChannelMarkers', () => {
  it('should return channel markers', async () => {
    client.http.get = jest.fn().mockResolvedValue(resolvedGetValue);

    const { data } = await getChannelMarkers(channelIds);

    expect(data).toEqual(expectedChannelMarkers);
  });

  test('should return fetched channel markers with correct paging', async () => {
    client.http.get = jest.fn().mockResolvedValueOnce(resolvedGetValue);

    await expect(getChannelMarkers(channelIds)).resolves.toEqual(
      expect.objectContaining({
        data: expectedChannelMarkers,
      }),
    );
  });

  test('should update cache after fetching channelMarkers ', async () => {
    enableCache();
    client.http.get = jest.fn().mockResolvedValue(resolvedGetValue);

    await getChannelMarkers(channelIds);
    const cacheKeyResolver = getResolver('channelMarker');

    const received = channelIds.map(
      entityId =>
        pullFromCache(['channelMarker', 'get', cacheKeyResolver({ entityId, userId })])?.data,
    );

    expect(received).toEqual(expectedChannelMarkers);

    disableCache();
  });

  test('should throw an error if request fails', async () => {
    client.http.get = jest
      .fn()
      .mockRejectedValueOnce(
        new ASCApiError('Not Found', Amity.ServerError.ITEM_NOT_FOUND, Amity.ErrorLevel.ERROR),
      );

    await expect(getChannelMarkers(channelIds)).rejects.toThrow('Amity SDK (400400): Not Found');
  });

  test('should fire event `onChannelMarkerFetched`', async () => {
    let dispose;
    client.http.get = jest.fn().mockResolvedValue(resolvedGetValue);

    const callbackPromise = new Promise(resolve => {
      dispose = onChannelMarkerFetched(resolve);
    }).finally(dispose);

    await getChannelMarkers(channelIds);

    await expect(callbackPromise).resolves.toMatchObject(expectedChannelMarkers[0]);
  });

  test('should fire event `onUserMarkerFetched`', async () => {
    let dispose;
    client.http.get = jest.fn().mockResolvedValue(resolvedGetValue);

    const callbackPromise = new Promise(resolve => {
      dispose = onUserMarkerFetched(resolve);
    }).finally(dispose);

    await getChannelMarkers(channelIds);

    await expect(callbackPromise).resolves.toMatchObject(expectedUserMarkers[0]);
  });
});
