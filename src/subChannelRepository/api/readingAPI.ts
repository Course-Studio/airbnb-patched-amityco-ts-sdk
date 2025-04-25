import { ingestInCache } from '~/cache/api/ingestInCache';
import { getActiveClient } from '~/client/api/activeClient';
import { fireEvent } from '~/core/events';
import { convertChannelMarkerResponse, convertSubChannelMarkerResponse } from '~/utils/marker';

/**
 * ```js
 * import { SubChannel } from '@amityco/ts-sdk'
 * const success = await SubChannel('foo')
 * ```
 *
 * Mark all messages as read and start reading message inside channel
 *
 * @param messageFeedIds - Sub channel ID list to start reading.
 * @return A success boolean if reading of the sub channel had begun.
 *
 * @category Channel API
 * @async
 * @private
 */
export const readingAPI = async (
  messageFeedIds: Amity.SubChannel['subChannelId'][],
): Promise<boolean> => {
  const client = getActiveClient();
  client.log('subChannel/readingAPI', messageFeedIds);

  const { data: payload } = await client.http.post<Amity.ReadingPayload>(
    `/api/v1/markers/message-feeds/reading`,
    { messageFeedIds },
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
