import { getActiveClient } from '~/client/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { convertChannelMarkerResponse, convertSubChannelMarkerResponse } from '~/utils/marker';

/**
 * ```js
 * import { MessageRepository } from '@amityco/ts-sdk'
 * const success = await MessageRepository.markAsDelivered('subChannelId', 'messageId')
 * ```
 *
 * Update `deliveredToSegment` in  {@link Amity.SubChannelMarker}
 *
 * @param subChannelId the ID of the {@link Amity.SubChannel} of message
 * @param messageId the ID of the {@link Amity.Message} to mark delivered
 * @returns A success boolean if the {@link Amity.SubChannel} was updated
 *
 * @category Message API
 * @async
 */
export const markAsDelivered = async (
  subChannelId: Amity.Message['subChannelId'],
  messageId: Amity.Message['messageId'],
): Promise<boolean> => {
  const client = getActiveClient();
  client.log('message/markAsDelivered', subChannelId, messageId);

  const { data } = await client.http.put<Amity.MarkDeliveredPayload>(
    `/api/v1/markers/message-feeds/${subChannelId}/mark-delivering`,
    { messageId },
  );

  const { userMarkers, userEntityMarkers, userFeedMarkers, ...rest } = data;

  const cachedAt = client.cache && Date.now();

  if (client.cache)
    ingestInCache(
      {
        userMarkers,
        userEntityMarkers: convertChannelMarkerResponse(userEntityMarkers),
        userFeedMarkers: convertSubChannelMarkerResponse(userFeedMarkers),
        ...rest,
      },
      { cachedAt },
    );

  return true;
};
