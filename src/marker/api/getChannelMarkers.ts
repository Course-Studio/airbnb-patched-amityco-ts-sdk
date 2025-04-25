import { getActiveClient } from '~/client/api/activeClient';
import { fireEvent } from '~/core/events';
import { toPage, toToken } from '~/core/query';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { convertChannelMarkerResponse } from '~/utils/marker';

/**
 * ```js
 * import { getChannelMarker } from '@amityco/ts-sdk'
 * const channelMarkers = await getChannelMarkers(['ch1', 'ch2'])
 * ```
 *
 * @param channelIds the IDs of the {@link Amity.RawChannel} marker to fetch
 * @returns A List of {@link Amity.ChannelMarker} by channelIds
 *
 * @category Channel API
 * @async
 * @private
 */
export const getChannelMarkers = async (
  channelIds: Amity.Channel['channelId'][],
): Promise<Amity.Cached<Amity.ChannelMarker[]>> => {
  const client = getActiveClient();
  client.log('channel/getChannelMarkers', channelIds);

  const { data: queryPayload } = await client.http.get<
    Amity.ChannelMarkerPayload & Amity.Pagination
  >(`/api/v1/markers/channels`, {
    params: {
      channelIds,
    },
  });

  const { userEntityMarkers: userEntityMarkersPayload, userMarkers } = queryPayload;

  const userEntityMarkers = convertChannelMarkerResponse(userEntityMarkersPayload);

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache({ userEntityMarkers, userMarkers }, { cachedAt });

  fireEvent('local.channelMarker.fetched', {
    userEntityMarkers,
  });
  fireEvent('local.userMarker.fetched', { userMarkers });

  return { data: userEntityMarkers, cachedAt };
};
