import { getActiveClient } from '~/client/api/activeClient';
import { getUserMessageFeedMakers } from '~/marker/api/getUserMessageFeedMarkers';
import { persistUnreadCountInfo } from '~/marker/utils/persistUnreadCountInfo';

export const prepareUnreadCountInfo = async (rawPayload: Amity.ChannelPayload) => {
  const client = getActiveClient();
  // if consistent mode is enabled, persist the unread count info to the cache

  // Marker service API uses channelInternalId as channelId
  const queryPayload = await getUserMessageFeedMakers(
    rawPayload.channels.map(({ channelInternalId }) => channelInternalId),
  );

  const { feedMarkers, userFeedMarkers } = queryPayload;
  persistUnreadCountInfo({
    feedMarkers,
    userFeedMarkers,
  });

  client.log('channel/prepareUnreadCountInfo', rawPayload.channels);
};
