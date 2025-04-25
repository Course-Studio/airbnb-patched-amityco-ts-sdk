import { getActiveClient } from '~/client/api/activeClient';
import { fireEvent } from '~/core/events';
import { toPage, toToken } from '~/core/query';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { convertChannelMarkerResponse, convertSubChannelMarkerResponse } from '~/utils/marker';
import { persistUnreadCountInfo } from '../utils/persistUnreadCountInfo';

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
export const getSubChannelMarkers = async (
  messageFeedIds: Amity.RawSubChannel['messageFeedId'][],
  page: Amity.Page = { limit: 100 },
): Promise<Amity.Cached<Amity.Paged<Amity.SubChannelMarker>>> => {
  const client = getActiveClient();
  client.log('channel/getSubChannelMarkers', messageFeedIds, page);

  const { data: queryPayload } = await client.http.get<
    Amity.SubChannelMarkerPayload & Amity.Pagination
  >(`/api/v1/markers/message-feeds`, {
    params: {
      messageFeedIds,
      options: {
        token: toToken(page, 'skiplimit'),
      },
    },
  });

  const { paging, ...payload } = queryPayload;
  const {
    userEntityMarkers: userEntityMarkersPayload,
    userFeedMarkers: userFeedMarkersPayload,
    userMarkers,
    feedMarkers: feedMarkersPayload,
  } = payload;

  // if consistent mode is enabled, persist the unread count info to the cache
  if (client.isUnreadCountEnabled && client.getMarkerSyncConsistentMode()) {
    persistUnreadCountInfo({
      feedMarkers: feedMarkersPayload,
      userFeedMarkers: userFeedMarkersPayload,
    });
  }

  const userEntityMarkers = convertChannelMarkerResponse(userEntityMarkersPayload);
  const userFeedMarkers = convertSubChannelMarkerResponse(userFeedMarkersPayload);

  const cachedAt = client.cache && Date.now();
  if (client.cache)
    ingestInCache({ userEntityMarkers, userFeedMarkers, userMarkers }, { cachedAt });

  fireEvent('local.channelMarker.fetched', { userEntityMarkers });
  fireEvent('local.subChannelMarker.fetched', { userFeedMarkers });
  fireEvent('local.userMarker.fetched', { userMarkers });

  const nextPage = toPage(paging.next);
  const prevPage = toPage(paging.previous);

  return { data: userFeedMarkers, cachedAt, prevPage, nextPage };
};
