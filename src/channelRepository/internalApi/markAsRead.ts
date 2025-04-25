import { getActiveClient } from '~/client/api/activeClient';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { convertChannelMarkerResponse, convertSubChannelMarkerResponse } from '~/utils/marker';
import { fireEvent } from '~/core/events';

/**
 * ```js
 * import { ChannelRepository } from '@amityco/ts-sdk'
 * const success = await ChannelRepository.markAsRead('channelId')
 * ```
 * Updating all {@link Amity.SubChannel} in specify {@link Amity.Channel} as read
 *
 * @param channelId the ID of to specify {@link Amity.Channel}
 * @returns A success boolean if the {@link Amity.Channel} was mark read
 *
 * @category Channel API
 * @async
 */
export const markAsRead = async (
  channelId: Amity.Channel['channelInternalId'],
): Promise<boolean> => {
  const client = getActiveClient();
  client.log('channel/markAsRead', channelId);

  const { data } = await client.http.put<Amity.MarkAsReadPayload>(
    `/api/v1/markers/channels/${channelId}/mark-read`,
  );

  const {
    userMarkers,
    userEntityMarkers: userEntityMarkersPayload,
    userFeedMarkers: userFeedMarkersPayload,
    ...rest
  } = data;

  const cachedAt = client.cache && Date.now();
  const channelMarkers = convertChannelMarkerResponse(userEntityMarkersPayload);
  const subChannelMarkers = convertSubChannelMarkerResponse(userFeedMarkersPayload);

  if (client.cache)
    ingestInCache(
      {
        userMarkers,
        userEntityMarkers: channelMarkers,
        userFeedMarkers: subChannelMarkers,
        ...rest,
      },
      { cachedAt },
    );

  fireEvent('local.channelMarker.updated', {
    userEntityMarkers: channelMarkers,
  });

  fireEvent('local.subChannelMarker.updated', {
    userFeedMarkers: subChannelMarkers,
  });

  return true;
};
