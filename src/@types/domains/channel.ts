export {};

declare global {
  namespace Amity {
    type ChannelType = 'broadcast' | 'conversation' | 'community' | 'live';

    type ChannelMemberActionType =
      | 'onJoin'
      | 'onLeft'
      | 'onMemberRead'
      | 'onMemberAdded'
      | 'onMemberRemoved'
      | 'onChannelMemberBanned'
      | 'onChannelMemberUnbanned'
      | 'onChannelMemberRoleAdded'
      | 'onChannelMemberRoleRemoved';

    const enum ChannelActionType {
      OnResolveChannel = 'onResolveChannel',
      OnResolveUnread = 'OnResolveUnread',
      OnFetch = 'onFetch',
      OnCreate = 'onCreate',
      OnUpdate = 'onUpdate',
      OnDelete = 'onDelete',
      OnJoin = 'onJoin',
      OnLeft = 'onLeft',
      OnMute = 'onMute',
      OnMemberAdded = 'onMemberAdded',
      OnMemberRemoved = 'onMemberRemoved',
      OnUserMessageFeedMarkerFetch = 'onUserMessageFeedMarkerFetch',
    }

    type RawChannel<T extends ChannelType = any> = {
      _id: string;
      channelId: string;
      channelInternalId: string;
      channelPublicId: string;
      displayName?: string;
      avatarFileId?: Amity.File<'image'>['fileId'];
      type: T;

      isDistinct?: boolean;

      isMuted?: boolean;
      muteTimeout?: string;

      isRateLimited?: boolean;
      rateLimit?: number;
      rateLimitWindow?: number;
      rateLimitTimeout?: number;

      messageAutoDeleteEnabled?: boolean;
      autoDeleteMessageByFlagLimit?: number;

      memberCount?: number;
      messageCount: number;
      moderatorMemberCount?: number;

      messagePreviewId?: string;

      isPublic?: boolean;

      lastActivity: Amity.timestamp;
    } & Amity.Metadata &
      Amity.Taggable &
      Amity.Timestamps &
      Amity.SoftDelete &
      Amity.Subscribable;

    // Use for the data stored in the local cache and local event payload
    type StaticInternalChannel<T extends ChannelType = any> = RawChannel<T> & {
      defaultSubChannelId: string;
      isUnreadCountSupport: boolean;
    };

    /**
     * Internal used only
     * same as Amity.ChannelModel in tech spec
     * It's used for the data calculated in SDK side contained dynamic values and removed unused fields
     */
    type InternalChannel<T extends ChannelType = any> = Omit<
      StaticInternalChannel<T>,
      'messageCount'
    > & {
      isMentioned: boolean;
      subChannelsUnreadCount: number;
      // legacy unread count does not use the maker service
      unreadCount: number;
    };

    /* public type */
    // with linked object
    type Channel<T extends ChannelType = any> = InternalChannel<T> & {
      messagePreview?: Amity.MessagePreview | null;
      markAsRead: () => Promise<boolean>;
    };

    type QueryChannels = {
      channelIds?: Amity.Channel['channelId'][];
      displayName?: string;
      membership?: 'all' | 'member' | 'notMember';
      sortBy?: 'displayName' | 'firstCreated' | 'lastCreated' | 'lastActivity';
      types?: Amity.ChannelType[];
      isDeleted?: Amity.Channel['isDeleted'];
      tags?: Amity.Taggable['tags'];
      excludeTags?: Amity.Taggable['tags'];
      limit?: number;
      page?: Amity.Page;
    };

    type ChannelLiveCollection = Amity.LiveCollectionParams<Omit<QueryChannels, 'page'>>;

    type ChannelLiveCollectionCache = Amity.LiveCollectionCache<
      Amity.Channel['channelId'],
      Pick<QueryChannels, 'page'>
    >;

    type QueryChannelMembers = {
      channelId: Amity.Channel['channelId'];
      memberships?: Array<Exclude<Amity.Membership<'channel'>['membership'], 'none'> | 'muted'>;
      roles?: string[];
      sortBy?: 'firstCreated' | 'lastCreated';
      search?: string;
      page?: Amity.Page;
      includeDeleted?: boolean;
    };

    type SearchChannelMembers = Amity.LiveCollectionParams<Omit<QueryChannelMembers, 'sortBy'>>;

    type ChannelMembersLiveCollection = Amity.LiveCollectionParams<
      Omit<QueryChannelMembers, 'page'>
    >;

    type SearchChannelMembersLiveCollection = Amity.LiveCollectionParams<
      Omit<SearchChannelMembers, 'page'>
    >;

    type ChannelMembersLiveCollectionCache = Amity.LiveCollectionCache<
      Amity.Membership<'channel'>['userId'],
      Pick<QueryChannelMembers, 'page'>
    >;

    // Use for channel's unread count value stored in the local cache
    type ChannelUnread = {
      channelId: Amity.Channel['channelId'];
      unreadCount: number;
      isMentioned: boolean;
      readToSegment: number | null;
      lastSegment: number;
      lastMentionedSegment: number | null;
      isDeleted: boolean;
    };
  }
}
