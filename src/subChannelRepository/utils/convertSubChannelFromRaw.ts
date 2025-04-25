import { getSubChannelIsMentioned } from './getSubChannelIsMentioned';
import { getSubChannelUnreadCount } from './getSubChannelUnreadCount';

export const MARKER_INCLUDED_SUB_CHANNEL_TYPE = ['broadcast', 'conversation', 'community'];

export const isUnreadCountSupport = ({ channelType }: Pick<Amity.RawSubChannel, 'channelType'>) =>
  MARKER_INCLUDED_SUB_CHANNEL_TYPE.includes(channelType);

export function convertFromRaw({
  channelId,
  channelPublicId,
  channelType,
  childCount,
  creatorId,
  creatorPublicId,
  lastMessageId,
  lastMessageTimestamp,
  messageFeedId,
  name,
  ...rest
}: Amity.RawSubChannel): Amity.SubChannel {
  return {
    get unreadCount() {
      return getSubChannelUnreadCount(channelId, messageFeedId);
    },
    get hasMentioned() {
      return getSubChannelIsMentioned(channelId, messageFeedId);
    },
    get isMentioned() {
      return getSubChannelIsMentioned(channelId, messageFeedId);
    },
    ...rest,
    channelId: channelPublicId,
    creatorId: creatorPublicId,
    displayName: name,
    lastActivity: lastMessageTimestamp,
    latestMessageId: lastMessageId,
    messageCount: childCount,
    subChannelId: messageFeedId,
    isUnreadCountSupport: isUnreadCountSupport({ channelType }),
  };
}
