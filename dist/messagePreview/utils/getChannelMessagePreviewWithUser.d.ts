export declare const getChannelMessagePreviewWithUser: (channel: Amity.StaticInternalChannel) => {
    _id: string;
    channelId: string;
    channelInternalId: string;
    channelPublicId: string;
    displayName?: string;
    avatarFileId?: string;
    type: any;
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
    lastActivity: string;
} & Amity.Metadata & Amity.Taggable & Amity.CreatedAt & Amity.UpdatedAt & Amity.DeletedAt & {
    isDeleted?: boolean;
} & Amity.Subscribable & {
    defaultSubChannelId: string;
    isUnreadCountSupport: boolean;
} & {
    messagePreview: Amity.MessagePreview | null;
};
