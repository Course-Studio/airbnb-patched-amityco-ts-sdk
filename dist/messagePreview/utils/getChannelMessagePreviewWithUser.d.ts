export declare const getChannelMessagePreviewWithUser: (channel: Amity.StaticInternalChannel) => {
    _id: string;
    channelId: string;
    channelInternalId: string;
    channelPublicId: string;
    displayName?: string | undefined;
    avatarFileId?: string | undefined;
    type: any;
    isDistinct?: boolean | undefined;
    isMuted?: boolean | undefined;
    muteTimeout?: string | undefined;
    isRateLimited?: boolean | undefined;
    rateLimit?: number | undefined;
    rateLimitWindow?: number | undefined;
    rateLimitTimeout?: number | undefined;
    messageAutoDeleteEnabled?: boolean | undefined;
    autoDeleteMessageByFlagLimit?: number | undefined;
    memberCount?: number | undefined;
    messageCount: number;
    moderatorMemberCount?: number | undefined;
    messagePreviewId?: string | undefined;
    isPublic?: boolean | undefined;
    lastActivity: string;
} & Amity.Metadata & Amity.Taggable & Amity.CreatedAt & Amity.UpdatedAt & Amity.DeletedAt & {
    isDeleted?: boolean | undefined;
} & Amity.Subscribable & {
    defaultSubChannelId: string;
    isUnreadCountSupport: boolean;
} & {
    messagePreview: Amity.MessagePreview | null;
};
//# sourceMappingURL=getChannelMessagePreviewWithUser.d.ts.map