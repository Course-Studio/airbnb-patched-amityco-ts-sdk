import { ingestInCache } from '~/cache/api/ingestInCache';
import { getActiveClient } from '~/client/api/activeClient';
import { fireEvent } from '~/core/events';
import { convertChannelMarkerResponse, convertSubChannelMarkerResponse } from '~/utils/marker';

/**
 * ```js
 * import { stopReading } from '@amityco/ts-sdk'
 * const success = await stopReading('foo')
 * ```
 *
 * Mark all messages as read and stop reading message inside channel
 *
 * @param messageFeedId - The sub channel ID to stop reading.
 * @return A success boolean if reading of the sub channel had begun.
 *
 * @category Channel API
 * @async
 * @private
 */
export const stopReadingAPI = async (
  messageFeedId: Amity.SubChannel['subChannelId'],
): Promise<boolean> => {
  const client = getActiveClient();
  client.log('channel/stopReadingAPI', messageFeedId);

  const { data: payload } = await client.http.post<Amity.StopReadingPayload>(
    `/api/v1/markers/message-feeds/${messageFeedId}/stop-reading`,
  );

  const {
    userEntityMarkers: userEntityMarkersPayload,
    userFeedMarkers: userFeedMarkersPayload,
    feedMarkers,
    userMarkers,
  } = payload;

  const userEntityMarkers = convertChannelMarkerResponse(userEntityMarkersPayload);
  const userFeedMarkers = convertSubChannelMarkerResponse(userFeedMarkersPayload);

  const cachedAt = client.cache && Date.now();
  if (client.cache)
    ingestInCache({ userEntityMarkers, userFeedMarkers, feedMarkers, userMarkers }, { cachedAt });

  fireEvent('local.feedMarker.fetched', { feedMarkers });
  fireEvent('local.channelMarker.fetched', { userEntityMarkers });
  fireEvent('local.subChannelMarker.fetched', { userFeedMarkers });
  fireEvent('local.userMarker.fetched', { userMarkers });

  return true;
};
