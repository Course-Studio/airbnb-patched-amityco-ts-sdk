import { ingestInCache } from '~/cache/api/ingestInCache';
import { convertRawMembershipToMembership } from '~/group/utils/withUser';
import { getChannelMarkers } from '~/marker/api/getChannelMarkers';

import { updateChannelMessagePreviewCache } from '~/messagePreview/utils';
import { getActiveClient } from '~/client/api/activeClient';
import { pullFromCache } from '~/cache/api/pullFromCache';
import { convertRawUserToInternalUser } from '~/userRepository/utils/convertRawUserToInternalUser';
import { pushToCache } from '~/cache/api';

export const MARKER_INCLUDED_CHANNEL_TYPE = ['broadcast', 'conversation', 'community'];
export const isUnreadCountSupport = ({ type }: Pick<Amity.RawChannel, 'type'>) =>
  MARKER_INCLUDED_CHANNEL_TYPE.includes(type);

export function convertFromRaw(
  channel: Amity.RawChannel,
  options: { isMessagePreviewUpdated?: boolean } = { isMessagePreviewUpdated: true },
): Amity.StaticInternalChannel {
  let { messagePreviewId } = channel;

  const messagePreviewChannelCache = pullFromCache<Amity.InternalMessagePreview>([
    'messagePreviewChannel',
    'get',
    channel.channelId,
  ])?.data;

  if (messagePreviewChannelCache?.messagePreviewId && !options.isMessagePreviewUpdated) {
    messagePreviewId = messagePreviewChannelCache.messagePreviewId;
  }

  return {
    ...channel,
    defaultSubChannelId: channel.channelInternalId,
    isUnreadCountSupport: isUnreadCountSupport(channel),
    messagePreviewId,
  };
}

export const preUpdateChannelCache = (
  rawPayload: Amity.ChannelPayload,
  options: { isMessagePreviewUpdated?: boolean } = { isMessagePreviewUpdated: true },
) => {
  ingestInCache({
    channels: rawPayload.channels.map(channel =>
      convertFromRaw(channel, { isMessagePreviewUpdated: options.isMessagePreviewUpdated }),
    ),
  });
};

const updateChannelUnread = ({
  currentUserId,
  channels,
  channelUsers,
}: {
  currentUserId: Amity.User['userId'];
  channels: Amity.RawChannel[];
  channelUsers: Amity.RawMembership<'channel'>[];
}) => {
  for (let i = 0; i < channels.length; i += 1) {
    const cacheKey = ['channelUnread', 'get', channels[i].channelId];
    const channelUser = channelUsers.find(
      channelUser =>
        channelUser.channelId === channels[i].channelId && channelUser.userId === currentUserId,
    );

    let unreadCount = 0;
    let readToSegment = null;
    let lastMentionedSegment = null;
    let isMentioned = false;

    if (channelUser) {
      readToSegment = channelUser.readToSegment;
      lastMentionedSegment = channelUser.lastMentionedSegment;
      unreadCount = Math.max(channels[i].messageCount - readToSegment, 0);
      isMentioned = lastMentionedSegment > readToSegment;
    }

    const cacheChannelUnread: Amity.ChannelUnread = {
      channelId: channels[i].channelId,
      lastSegment: channels[i].messageCount,
      readToSegment,
      lastMentionedSegment,
      unreadCount,
      isMentioned,
      isDeleted: channels[i].isDeleted || false,
    };

    pushToCache(cacheKey, cacheChannelUnread);
  }
};

export const prepareChannelPayload = async (
  rawPayload: Amity.ChannelPayload,
  options: { isMessagePreviewUpdated?: boolean } = { isMessagePreviewUpdated: true },
): Promise<Amity.ProcessedChannelPayload> => {
  const client = getActiveClient();
  const networkPreviewSetting = await client.getMessagePreviewSetting(false);

  if (
    options.isMessagePreviewUpdated &&
    networkPreviewSetting !== Amity.MessagePreviewSetting.NO_MESSAGE_PREVIEW &&
    rawPayload.messagePreviews &&
    rawPayload.messagePreviews.length > 0
  ) {
    updateChannelMessagePreviewCache(rawPayload);
  }

  if (client.useLegacyUnreadCount) {
    updateChannelUnread({
      channels: rawPayload.channels,
      channelUsers: rawPayload.channelUsers,
      currentUserId: client.userId!,
    });
  } else {
    const markerIds = rawPayload.channels
      // filter channel by type. Only conversation, community and broadcast type are included.
      .filter(isUnreadCountSupport)
      .map(({ channelInternalId }) => channelInternalId);

    if (markerIds.length > 0) {
      // since the get markers method requires a channel cache to function with the reducer.
      preUpdateChannelCache(rawPayload, {
        isMessagePreviewUpdated: options.isMessagePreviewUpdated,
      });

      try {
        await getChannelMarkers(markerIds);
      } catch (e) {
        // empty block (from the spec, allow marker fetch to fail without having to do anything)
      }
    }
  }

  // convert raw channel to internal channel
  const channels = rawPayload.channels.map(payload =>
    convertFromRaw(payload, { isMessagePreviewUpdated: options.isMessagePreviewUpdated }),
  );

  // convert raw channel user to membership (add user object)
  const channelUsers: Amity.Membership<'channel'>[] = rawPayload.channelUsers.map(channelUser => {
    return convertRawMembershipToMembership<'channel'>(channelUser);
  });

  const users = rawPayload.users.map(convertRawUserToInternalUser);

  const { messageFeedsInfo, messagePreviews, ...restRawPayload } = rawPayload;

  return {
    ...restRawPayload,
    users,
    channels,
    channelUsers,
  };
};
