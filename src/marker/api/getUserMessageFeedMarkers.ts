import { getActiveClient } from '~/client/api/activeClient';
import { fireEvent } from '~/core/events';

/**
 * ```js
 * import { getSubChannelMarkers } from '@amityco/ts-sdk'
 * const subChannelMarkers = await getSubChannelMarkers(['sch1', 'sch2'])
 * ```
 *
 * Fetches a paginable list of {@link Amity.SubChannelMarker} objects
 *
 * @param messageFeedIds the feed IDs of the {@link Amity.RawSubChannel} marker to fetch
 * @param page
 * @returns A page of {@link Amity.SubChannelMarker} objects
 *
 * @category Channel API
 * @async
 * @private
 */
export const getUserMessageFeedMakers = async (
  channelIds: Amity.RawChannel['channelId'][],
): Promise<Amity.UserMessageFeedMarkerPayload> => {
  const client = getActiveClient();
  client.log('channel/getUserMessageFeedMakers', channelIds);

  const { data } = await client.http.get<Amity.UserMessageFeedMarkerPayload>(
    `/api/v1/markers/user-message-feed`,
    {
      params: {
        channelIds,
      },
    },
  );

  fireEvent('local.userMessageFeedMarker.fetched', { userMessageFeedMarker: data });

  return data;
};
