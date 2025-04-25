export {};

declare global {
  namespace Amity {
    type Payloads = {
      user: Amity.UserPayload;
      file: Amity.FilePayload;
      role: Amity.RolePayload;
      channel: Amity.ChannelPayload;
      subChannel: Amity.SubChannelPayload;
      channelUser: Amity.ChannelMembershipPayload;
      message: Amity.MessagePayload;
      community: Amity.CommunityPayload;
      category: Amity.CategoryPayload;
      communityUser: Amity.CommunityMembershipPayload;
      post: Amity.PostPayload;
      comment: Amity.CommentPayload;
      poll: Amity.PollPayload;
      stream: Amity.StreamPayload;
      story: Amity.StoryPayload;
      globalStoryFeed: Amity.GlobalStoryFeedPayload;
      reaction: Amity.ReactionPayload;
      pinnedPost: Amity.PinnedPostPayload;
      follower: Amity.FollowersPayload;
      following: Amity.FollowingsPayload;
      blockUser: Amity.BlockedUserPayload;
      semanticSearchPost: Amity.SemanticSearchPostPayload;
      semanticSearchCommunity: Amity.SemanticSearchCommunityPayload;
      notificationTrayItem: Amity.NotificationTrayPayload;
    };

    type UserPayload = {
      users: Amity.RawUser[];
      files: Amity.File<'image'>[];
    };

    type ProcessedUserPayload = {
      users: Amity.InternalUser[];
      files: Amity.File<'image'>[];
    };

    type FeedSettingPayload = {
      feedSettings: {
        contentSettings: Amity.ContentSetting[];
        feedType: Amity.ContentFeedType;
      }[];
    };

    type AdPayload = {
      ads: Amity.RawAd[];
      advertisers: Amity.RawAdvertiser[];
      files: Amity.File[];
      settings: Amity.AdsSettings;
    };

    // API-FIX: backend should return a payload like { files: Amity.File<T>[] }
    type CreateFilePayload<T extends Amity.FileType = any> = Amity.File<T>[];
    type FilePayload<T extends Amity.FileType = any> = Amity.File<T>;

    type RolePayload = {
      roles: Amity.Role[];
    };

    type ChannelPayload<T extends Amity.ChannelType = any> = Amity.UserPayload & {
      channels: Amity.RawChannel<T>[];
      channelUsers: Amity.RawMembership<'channel'>[];
      messagePreviews: Amity.MessagePreviewPayload[];
      messageFeedsInfo?: Amity.messageFeedsInfoPayload[];
    };

    /**
     * Items that extend from `Amity.Channel`
     * - channels: `Amity.RawChannel` -> `Amity.Channel` (Added Marker Service related props)
     * - channelUsers: `Amity.RawMembership` -> `Amity.Membership` (Add user getter prop)
     */
    type ProcessedChannelPayload<T extends Amity.ChannelType = any> = Omit<
      ChannelPayload,
      'channels' | 'channelUsers' | 'messagePreviews' | 'messageFeedsInfo' | 'users'
    > & {
      channels: Amity.StaticInternalChannel<T>[];
      channelUsers: Amity.Membership<'channel'>[];
      users: Amity.InternalUser[];
    };

    type UserMarkerResponse = Omit<Amity.UserMarker, 'hasMentioned'> & Amity.IsMentioned;
    type UserEntityMarkerResponse = Omit<Amity.ChannelMarker, 'hasMentioned'> & Amity.IsMentioned;
    type UserFeedMarkerResponse = Omit<Amity.SubChannelMarker, 'hasMentioned'> & {
      oldUnreadCount: number;
      lastMentionSegment: number;
    } & Amity.IsMentioned;

    type UserMarkerPayload = {
      userMarkers: UserMarkerResponse[];
    };

    type ChannelMarkerPayload = {
      userEntityMarkers: UserEntityMarkerResponse[];
      userMarkers: UserMarkerResponse[];
    };

    type SubChannelMarkerPayload = {
      feedMarkers: Amity.FeedMarker[];
      userFeedMarkers: UserFeedMarkerResponse[];
      userEntityMarkers: UserEntityMarkerResponse[];
      userMarkers: UserMarkerResponse[];
    };

    type UserMessageFeedMarkerPayload = {
      feedMarkers: Amity.FeedMarker[];
      userFeedMarkers: UserFeedMarkerResponse[];
    };

    type MessageMarkerPayload = {
      contentMarkers: Amity.MessageMarker[];
      feedMarkers: Amity.FeedMarker[];
      userMarkers: UserMarkerResponse[];
    };

    type MarkReadPayload = {
      userMarkers: UserMarkerResponse[];
      userEntityMarkers: UserEntityMarkerResponse[];
      userFeedMarkers: UserFeedMarkerResponse[];
      feedMarkers: Amity.MessageMarker[];
    };

    type MarkerSyncPayload = {
      userMarkers: UserMarkerResponse[];
      userEntityMarkers: UserEntityMarkerResponse[];
      userFeedMarkers: UserFeedMarkerResponse[];
      feedMarkers: Amity.FeedMarker[];
    };

    type MarkAsReadPayload = {
      userMarkers: UserMarkerResponse[];
      userEntityMarkers: UserEntityMarkerResponse[];
      userFeedMarkers: UserFeedMarkerResponse[];
      feedMarkers: Amity.FeedMarker[];
    };

    type MarkDeliveredPayload = {
      userMarkers: UserMarkerResponse[];
      userEntityMarkers: UserEntityMarkerResponse[];
      userFeedMarkers: UserFeedMarkerResponse[];
      feedMarkers: Amity.FeedMarker[];
    };

    type ReadUserPayload = {
      contentMarkers: Amity.MessageMarker[];
      feedMarkers: Amity.FeedMarker[];
      userFeedMarkers: UserFeedMarkerResponse[];
      publicUserIds: Amity.InternalUser['userId'][];
    };

    type DeliveredUserPayload = {
      contentMarkers: Amity.MessageMarker[];
      feedMarkers: Amity.FeedMarker[];
      userFeedMarkers: UserFeedMarkerResponse[];
      publicUserIds: Amity.InternalUser['userId'][];
    };

    type StartReadingPayload = {
      userMarkers: UserMarkerResponse[];
      userEntityMarkers: UserEntityMarkerResponse[];
      userFeedMarkers: UserFeedMarkerResponse[];
      feedMarkers: Amity.FeedMarker[];
    };

    type ReadingPayload = {
      userMarkers: UserMarkerResponse[];
      userEntityMarkers: UserEntityMarkerResponse[];
      userFeedMarkers: UserFeedMarkerResponse[];
      feedMarkers: Amity.FeedMarker[];
    };

    type StopReadingPayload = {
      userMarkers: UserMarkerResponse[];
      userEntityMarkers: UserEntityMarkerResponse[];
      userFeedMarkers: UserFeedMarkerResponse[];
      feedMarkers: Amity.FeedMarker[];
    };

    type MarkedMessagePayload = {
      contentMarkers: Amity.MessageMarker[];
      feedMarkers: Amity.FeedMarker[];
    };

    type FeedUpdatedPayload = {
      contentMarkers: Amity.MessageMarker[];
      feedMarkers: Amity.FeedMarker[];
    };

    type UserMarkerSyncPayload = {
      userMarkers: UserMarkerResponse[];
      userEntityMarkers: UserEntityMarkerResponse[];
      userFeedMarkers: UserFeedMarkerResponse[];
    };

    type UserFeedUpdatedPayload = {
      feedMarkers: Amity.FeedMarker[];
      userFeedMarkers: Amity.UserFeedMarkerResponse[];
    };

    type SubChannelPayload<T extends Amity.MessageContentType = any> = {
      messageFeeds: Amity.RawSubChannel[];
      messages: Amity.RawMessage<T>[];
      users: Amity.InternalUser[];
      files: Amity.File[];
    };

    /**
     * Items that extend from `Amity.SubChannelPayload`
     * - messageFeeds: `Amity.RawSubChannel` -> `Amity.SubChannel` (Model Restructuring)
     * - messages: `Amity.RawMessage` -> `Amity.Message` (Model Restructuring)
     */
    type ProcessedSubChannelPayload<T extends Amity.MessageContentType = any> = {
      messageFeeds: Amity.SubChannel[];
      messages: Amity.InternalMessage<T>[];
      users: Amity.InternalUser[];
      files: Amity.File[];
    };

    type ChannelMembershipPayload = {
      channels: Amity.RawChannel[];
      channelUsers: Amity.RawMembership<'channel'>[];
      messagePreviews: Amity.MessagePreviewPayload[];
      users: Amity.RawUser[];
    } & Omit<Amity.UserPayload, 'users'>;

    /**
     * Items that extend from `Amity.ChannelMembershipPayload`
     * - channels: `Amity.RawChannel` -> `Amity.Channel` (Added Marker Service related props)
     * - channelUsers: `Amity.RawMembership` -> `Amity.Membership` (Add user getter prop)
     */
    type ProcessedChannelMembershipPayload = Omit<
      ChannelMembershipPayload,
      'channels' | 'channelUsers'
    > & {
      channels: Amity.Channel[];
      channelUsers: Amity.Membership<'channel'>[];
      messagePreviews: Amity.MessagePreviewPayload[];
    };

    /**
     * Items that extend from `Amity.MessagePayload`
     * - messages: `Amity.RawMessage` -> `Amity.Message` (Model Restructuring)
     */
    type ProcessedMessagePayload<T extends Amity.MessageContentType = any> = {
      messages: Amity.InternalMessage<T>[];
      users: Amity.InternalUser[];
      files: Amity.File[];
      reactions: Amity.InternalReactor[];
    };

    type MessagePayload<T extends Amity.MessageContentType = any> = Omit<
      ProcessedMessagePayload<T>,
      'messages' | 'messageFeeds'
    > & {
      messages: Amity.RawMessage<T>[];
      messageFeeds?: Amity.RawSubChannel[];
    };

    type StreamPayload = {
      videoStreamings: Amity.InternalStream[];
      videoStreamModerations: Amity.StreamModeration[];
      users: Amity.InternalUser[];
      files: Amity.File<'image'>[];
    };

    type CommunityPayload = {
      communities: Amity.RawCommunity[];
      communityUsers: Amity.RawMembership<'community'>[];
      categories: Amity.InternalCategory[];
      feeds: Amity.Feed[];
      users: Amity.InternalUser[];
      files: Amity.File[];
    };

    type RecommendedCommunityPayload = Amity.CommunityPayload;
    type TrendingCommunityPayload = Amity.CommunityPayload;

    /**
     * Items that extend from `Amity.CommunityPayload`
     * - communities: `Amity.RawCommunity` -> `Amity.Community` (Added Marker Service related props)
     * - communityUsers: `Amity.RawMembership` -> `Amity.Membership` (Add user getter prop)
     */
    type ProcessedCommunityPayload = Omit<CommunityPayload, 'communities' | 'communityUsers'> & {
      communities: Amity.Community[];
      communityUsers: Amity.Membership<'community'>[];
    };

    type CategoryPayload = {
      categories: Amity.InternalCategory[];
      files: Amity.File[];
    };

    type CommunityMembershipPayload = {
      communities: Amity.RawCommunity[];
      communityUsers: Amity.RawMembership<'community'>[];
      categories: Amity.InternalCategory[];
      feeds: Amity.Feed[];
      users: Amity.InternalUser[];
      files: Amity.File[];
    };

    /**
     * Items that extend from `Amity.CommunityMembershipPayload`
     * - communities: `Amity.RawCommunity` -> `Amity.Community` (Added Marker Service related props)
     * - communityUsers: `Amity.RawMembership` -> `Amity.Membership` (Add user getter prop)
     */
    type ProcessedCommunityMembershipPayload = Omit<
      CommunityMembershipPayload,
      'communities' | 'communityUsers'
    > & {
      communities: Amity.Community[];
      communityUsers: Amity.Membership<'community'>[];
    };

    // Raw response from BE, not contain all linked objects
    type PostPayload<T extends Amity.PostContentType = any> = {
      posts: Amity.InternalPost<T>[];
      postChildren: Amity.InternalPost<T>[];
      communities: Amity.RawCommunity[];
      communityUsers: Amity.RawMembership<'community'>[];
      categories: Amity.InternalCategory[];
      comments: Amity.InternalComment[];
      feeds: Amity.Feed[];
      users: Amity.InternalUser[];
      files: Amity.File[];
      videoStreamings: Amity.RawStream[];
    };

    type SemanticSearchPostPayload = Amity.PostPayload & {
      searchResult: { postId: string; score: number }[];
      polls: Amity.RawPoll[];
    };

    type ProcessedSemanticSearchPostPayload = Amity.ProcessedPostPayload & {
      polls: Amity.InternalPoll[];
    };

    type SemanticSearchCommunityPayload = Amity.CommunityPayload & {
      searchResult: { communityId: string; score: number }[];
    };

    type ProcessedSemanticSearchCommunityPayload = Amity.ProcessedCommunityPayload;

    type StoryBasePayload = {
      comments: Amity.InternalComment[];
      files: Amity.File[];
      users: Amity.InternalUser[];
      communities: Amity.RawCommunity[];
      communityUsers: Amity.Membership<'community'>[];
      categories: Amity.InternalCategory[];
    };

    type StoryTargetPayload = {
      storyTargets: Amity.RawStoryTarget[];
    };

    type GlobalStoryFeedPayload = Omit<Amity.StoryBasePayload, 'comments'> &
      Amity.StoryTargetPayload;

    type ProcessedGlobalStoryFeed = Omit<GlobalStoryFeedPayload, 'communities'> & {
      communities: Amity.Community[];
    };

    // Original Payload form BE
    type StoryPayload = {
      stories: Amity.RawStory[];
    } & Amity.StoryBasePayload;

    // Payload with optimistic status
    type StoryWithOptimisticPayload = {
      stories: Amity.InternalStory[];
    } & Amity.StoryBasePayload;

    // Payload with Reaction
    type StoryReactionPayload = {
      reactions: Amity.InternalReactor[];
    } & Amity.StoryPayload;

    type NotificationTrayPayload = {
      notificationTrayItems: Amity.RawNotificationTrayItem[];
      users: Amity.RawUser[];
      files?: Amity.File[];
    };

    type ProcessedNotificationTrayPayload = Omit<
      NotificationTrayPayload,
      'notificationTrayItems' | 'users'
    > & {
      notificationTrayItems: Amity.InternalNotificationTrayItem[];
      users: Amity.InternalUser[];
      files?: Amity.File[];
    };

    type NotificationTraySeenPayload = {
      lastTraySeenAt: Amity.timestamp;
      lastTrayOccurredAt: Amity.timestamp;
    };

    type NotificationTraySeenUpdatedPayload = {
      lastSeenAt: Amity.timestamp;
    };

    type NotificationItemSeenPayload = {
      trayItems: { id: string; lastSeenAt: Amity.timestamp }[];
    };

    /**
     * Items that extend from `Amity.PostPayload`
     * - communities: `Amity.RawCommunity` -> `Amity.Community` (Added Marker Service related props)
     * - communityUsers: `Amity.RawMembership` -> `Amity.Membership` (Add user getter prop)
     */
    type ProcessedPostPayload = Omit<PostPayload, 'communities' | 'communityUsers' | 'posts'> & {
      posts: Amity.InternalPost[];
      communities: Amity.Community[];
      communityUsers: Amity.Membership<'community'>[];
    };

    type CommentPayload<T extends Amity.CommentContentType = any> = {
      comments: Amity.InternalComment<T>[];
      commentChildren: Amity.InternalComment[];
      users: Amity.InternalUser[];
      files: Amity.File[];
      communityUsers: Amity.Membership<'community'>[];
    };

    type ProcessedCommentPayload<T extends Amity.CommentContentType = any> = Omit<
      CommentPayload<T>,
      'users' | 'files' | 'communityUsers'
    >;

    type PollPayload = {
      users: Amity.InternalUser[];
      polls: Amity.Poll[];
    };

    type ReactionPayload = {
      reactions: Amity.Reaction[];
      users: Amity.InternalUser[];
    };

    type GlobalFeedPayload = Amity.PostPayload;

    type FollowStatusPayload = {
      follows: Amity.RawFollowStatus[];
    };

    type ProcessedFollowStatusPayload = {
      follows: Amity.InternalFollowStatus[];
    };

    type FollowInfoMePayload = {
      followCounts: Amity.FollowCount[];
    };

    type FollowersPayload = Amity.FollowStatusPayload & Amity.UserPayload;

    type ProcessedFollowersPayload = Amity.ProcessedFollowStatusPayload & {
      users: Amity.InternalUser[];
    };

    type FollowingsPayload = Amity.FollowersPayload;

    type ProcessedFollowingsPayload = Amity.ProcessedFollowersPayload;

    type FollowInfoPayload = FollowInfoMePayload & Amity.FollowStatusPayload;

    type BlockedPayload = {
      follows: Amity.FollowStatusPayload['follows'];
      followCounts: Amity.FollowCount[];
    };

    type ProcessedBlockedPayload = {
      follows: Amity.ProcessedFollowStatusPayload['follows'];
      followCounts: Amity.FollowCount[];
    };

    type BlockedUserPayload = Amity.FollowersPayload;

    type ProcessedBlockedUserPayload = Amity.BlockedUserPayload & {
      users: Amity.InternalUser[];
    };

    type MessagePreviewPayload<T extends Amity.MessageContentType = any> = {
      messageId: string;
      parentId: string;
      channelId: Amity.RawChannel['channelId'];
      channelPublicId: string;
      messageFeedId: Amity.RawSubChannel['messageFeedId'];
      data?: Amity.ContentData<T>;
      dataType?: T;
      creatorId: string;
      isDeleted: boolean;
      segment: number;
      creatorPublicId: string;
    } & Amity.Timestamps;

    type messageFeedsInfoPayload = {
      messagePreviewId: string;
      messageFeedId: string;
      name: string;
    } & Amity.Timestamps;

    type SubChannelMessagePreviewPayload<T extends Amity.MessageContentType = any> = {
      channelId: Amity.RawSubChannel['channelId'];
      channelPublicId: Amity.RawSubChannel['channelPublicId'];
      channelType: Amity.RawSubChannel['channelType'];
      childCount: number;
      creatorId: string;
      creatorPublicId: string;
      data?: Amity.ContentData<T>;
      dataType?: T;
      isDeleted?: boolean;
      mentionedUsers?: Amity.Message['mentionees'];
      messageFeedId: Amity.RawSubChannel['messageFeedId'];
      messageId: Amity.RawMessage['messageId'];
      parentId?: string;
      path: string;
      segment: Amity.RawMessage['segment'];
    } & Amity.Content<T> &
      Amity.Flaggable &
      Amity.Taggable &
      Amity.Timestamps;
  }
}
