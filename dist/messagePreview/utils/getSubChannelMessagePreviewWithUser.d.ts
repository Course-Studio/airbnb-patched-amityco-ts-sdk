export declare const getSubChannelMessagePreviewWithUser: (subChannel: Amity.SubChannel) => {
    messagePreview: {
        user: Amity.InternalUser | undefined;
        messagePreviewId: string;
        subChannelName: string;
        data?: string | Amity.ContentDataText | Amity.ContentDataFile | Amity.ContentDataImage | Amity.ContentDataVideo | Amity.ContentDataPoll | Record<string, unknown> | undefined;
        dataType?: any;
        channelId: string;
        subChannelId: string;
        isDeleted?: boolean | undefined;
        segment: number;
        subChannelUpdatedAt: string;
        creatorId: string;
        createdAt: string;
        updatedAt?: string | undefined;
    } | null;
    channelId: string;
    creatorId: string;
    displayName: string;
    editedAt?: string | undefined;
    isDeleted: boolean;
    messageCount: number;
    lastActivity: string;
    latestMessageId: string;
    subChannelId: string;
    isUnreadCountSupport: boolean;
    unreadCount: number;
    isMentioned: boolean;
    messagePreviewId?: string | null | undefined;
    createdAt: string;
    updatedAt?: string | undefined;
    path: string;
};
//# sourceMappingURL=getSubChannelMessagePreviewWithUser.d.ts.map