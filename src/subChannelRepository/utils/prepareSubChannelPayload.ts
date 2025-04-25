import { ingestInCache } from '~/cache/api/ingestInCache';
import { getSubChannelMarkers } from '~/marker/api';
import { convertFromRaw as convertMessageFromRaw } from '~/messageRepository/utils/prepareMessagePayload';
import { convertFromRaw as convertSubChannelFromRaw } from './convertSubChannelFromRaw';

import { updateSubChannelMessagePreviewCache } from '../../messagePreview/utils/updateSubChannelMessagePreviewCache';

export const MARKER_INCLUDED_SUB_CHANNEL_TYPE = ['broadcast', 'conversation', 'community'];

/**
 * Filter sub channel by type. Only conversation, community and broadcast type are included.
 */
export const isUnreadCountSupport = ({ channelType }: Pick<Amity.RawSubChannel, 'channelType'>) =>
  MARKER_INCLUDED_SUB_CHANNEL_TYPE.includes(channelType);

export const preUpdateSubChannelCache = (rawPayload: Amity.SubChannelPayload) => {
  ingestInCache({
    messageFeeds: rawPayload.messageFeeds.map(messageFeed => convertSubChannelFromRaw(messageFeed)),
  });
};

export const prepareSubChannelPayload = async (
  rawPayload: Amity.SubChannelPayload,
): Promise<Amity.ProcessedSubChannelPayload> => {
  const markerIds = rawPayload.messageFeeds
    .filter(isUnreadCountSupport)
    .map(({ messageFeedId }) => messageFeedId);

  if (markerIds.length > 0) {
    // since the get markers method requires a channel cache to function with the reducer.
    preUpdateSubChannelCache(rawPayload);

    try {
      await getSubChannelMarkers(markerIds);
    } catch (e) {
      // empty block (from the spec, allow marker fetch to fail without having to do anything)
    }
  }

  updateSubChannelMessagePreviewCache(rawPayload);

  // attach marker to sub channel
  const messageFeeds = rawPayload.messageFeeds.map(convertSubChannelFromRaw);

  const messages = rawPayload.messages.map(m => convertMessageFromRaw(m));

  return {
    ...rawPayload,
    messageFeeds,
    messages,
  };
};

type RawQuerySubChannels = Omit<Amity.QuerySubChannels, 'excludeDefaultSubChannel'> & {
  excludeDefaultMessageFeed?: Amity.QuerySubChannels['excludeDefaultSubChannel'];
};

export function convertQueryParams({
  excludeDefaultSubChannel,
  ...rest
}: Amity.QuerySubChannels): RawQuerySubChannels {
  const out: RawQuerySubChannels = { ...rest };

  if (excludeDefaultSubChannel !== undefined) {
    out.excludeDefaultMessageFeed = excludeDefaultSubChannel;
  }

  return out;
}
