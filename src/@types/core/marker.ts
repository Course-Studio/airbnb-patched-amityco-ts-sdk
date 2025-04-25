export {};

declare global {
  namespace Amity {
    type ChannelMarker = {
      entityId: Amity.RawChannel['channelId'];
      userId: Amity.InternalUser['userId'];
      unreadCount: number;
      isDeleted: boolean;
      hasMentioned: boolean;
    } & Amity.Timestamps;

    type SubChannelMarker = {
      feedId: Amity.RawSubChannel['messageFeedId'];
      entityId: Amity.RawChannel['channelId'];
      userId: Amity.InternalUser['userId'];
      readToSegment: number;
      deliveredToSegment: number;
      unreadCount: number;
      hasMentioned: boolean;
    } & Amity.Timestamps;

    type MessageMarker = {
      feedId: Amity.RawSubChannel['messageFeedId'];
      contentId: Amity.RawMessage['messageId'];
      creatorId: Amity.InternalUser['userId'];
      readCount: number;
      deliveredCount: number;
    } & Amity.Timestamps;

    type FeedMarker = {
      feedId: Amity.RawSubChannel['messageFeedId'];
      entityId: Amity.RawChannel['channelId'];
      lastSegment: number;
      isDeleted: boolean;
    } & Amity.Timestamps;

    type UserMarker = {
      userId: Amity.InternalUser['userId'];
      unreadCount: number;
      isMentioned: boolean;
    } & Amity.SyncAt &
      Amity.Timestamps;

    type UserFeedMarker = {
      userId: Amity.InternalUser['userId'];
      enityId: Amity.RawChannel['channelId'];
      feedId: Amity.RawSubChannel['messageFeedId'];
      readToSegment: number;
      deliveredToSegment: number;
      unreadCount: number;
      oldUnreadCount: number;
      lastMentionSegment: number;
      isMentioned: boolean;
    } & Amity.Timestamps;
  }
}
