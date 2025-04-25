import { getActiveClient } from '~/client/api/activeClient';
import { fireEvent } from '~/core/events';
import { ingestInCache } from '~/cache/api/ingestInCache';

/**
 * ```js
 * import { getMessageMarkers } from '@amityco/ts-sdk'
 * const messageMarkers = await getMessageMarkers(['sch1', 'sch2'])
 * ```
 *
 * Fetches a list of {@link Amity.MessageMarker} by messageIds
 *
 * @param messageIds the feed IDs of the {@link Amity.RawMessage} marker to fetch
 * @returns A list of {@link Amity.MessageMarker} by messageIds
 *
 * @category Channel API
 * @async
 * @private
 */
export const getMessageMarkers = async (
  messageIds: Amity.RawMessage['messageFeedId'][],
): Promise<Amity.Cached<Amity.MessageMarker[]>> => {
  const client = getActiveClient();
  client.log('channel/getMessageMarkers', messageIds);

  const { data: queryPayload } = await client.http.get<Amity.MessageMarkerPayload>(
    `/api/v1/markers/messages`,
    {
      params: {
        messageIds,
      },
    },
  );

  const { contentMarkers, feedMarkers, userMarkers } = queryPayload;

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache({ contentMarkers, feedMarkers, userMarkers }, { cachedAt });

  fireEvent('local.feedMarker.fetched', { feedMarkers });
  fireEvent('local.messageMarker.fetched', { contentMarkers });
  fireEvent('local.userMarker.fetched', { userMarkers });

  return { data: contentMarkers, cachedAt };
};
