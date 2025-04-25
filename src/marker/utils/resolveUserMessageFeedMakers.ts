import { getUserMessageFeedMakers } from '../api/getUserMessageFeedMarkers';
import { fireEvent } from '~/core/events';
import { persistUnreadCountInfo } from './persistUnreadCountInfo';

export const resolveUserMessageFeedMarkers = async (
  channelIds: Amity.InternalChannel['channelInternalId'][],
) => {
  const queryPayload = await getUserMessageFeedMakers(channelIds);

  const { feedMarkers, userFeedMarkers } = queryPayload;
  persistUnreadCountInfo({
    feedMarkers,
    userFeedMarkers,
  });

  fireEvent('local.userMessageFeedMarkers.resolved', { feedMarkers, userFeedMarkers });
};
