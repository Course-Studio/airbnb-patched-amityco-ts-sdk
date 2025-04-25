import { ingestInCache } from '~/cache/api/ingestInCache';
import { fireEvent } from '~/core/events';

import { getActiveClient } from './activeClient';
import { convertChannelMarkerResponse, convertSubChannelMarkerResponse } from '~/utils/marker';

/**
 * ```js
 * import { markerSync } from '@amityco/ts-sdk'
 * const success = await markerSync()
 * ```
 *
 * Make all markers synced
 * * If response is empty means that the sync has ended.
 * * If response is not empty, the sync has not ended. You must call markerSync
 * again to continue syncing.
 *
 * @return {hasMore} A success boolean if the marker sync was ended.
 *
 * @category Marker API
 * @async
 * @private
 */
export const markerSync = async (
  deviceLastSyncAt: string,
): Promise<{
  data: Amity.MarkerSyncPayload;
  hasMore: boolean;
}> => {
  const client = getActiveClient();
  client.log('channel/markerSync');

  const { data: payload } = await client.http.post<Amity.MarkerSyncPayload>(
    `/api/v1/markers/sync`,
    { deviceLastSyncAt },
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

  return {
    data: payload,
    hasMore: payload.feedMarkers.length > 0,
  };
};
