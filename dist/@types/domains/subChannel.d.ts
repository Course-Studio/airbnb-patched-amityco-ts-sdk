export {};
declare global {
    namespace Amity {
        type RawSubChannel = {
            channelId: string;
            channelPublicId: string;
            channelType: Amity.ChannelType;
            childCount: number;
            creatorId: string;
            creatorPublicId: string;
            editedAt?: Amity.timestamp;
            isDeleted: boolean;
            messageFeedId: string;
            lastMessageId: string;
            lastMessageTimestamp: Amity.timestamp;
            name: string;
            messagePreviewId?: string | null;
        } & Amity.Timestamps & Amity.Subscribable;
        type SubChannel = {
            channelId: string;
            creatorId: string;
            displayName: string;
            editedAt?: Amity.timestamp;
            isDeleted: boolean;
            messageCount: number;
            lastActivity: Amity.timestamp;
            latestMessageId: string;
            subChannelId: string;
            isUnreadCountSupport: boolean;
            unreadCount: number;
            isMentioned: boolean;
            messagePreviewId?: string | null;
            messagePreview?: Amity.MessagePreview | null;
        } & Amity.Timestamps & Amity.Subscribable;
        type QuerySubChannels = {
            channelId: Amity.Channel['channelId'];
            excludeDefaultSubChannel?: boolean;
            includeDeleted?: boolean;
            page?: Amity.Page;
            pageToken?: string;
        };
        type SubChannelLiveCollection = Amity.LiveCollectionParams<Omit<QuerySubChannels, 'page'>>;
        type SubChannelLiveCollectionCache = Amity.LiveCollectionCache<Amity.SubChannel['subChannelId'], Pick<QuerySubChannels, 'page'> & {
            paging?: Amity.Pagination['paging'];
        }>;
    }
}
//# sourceMappingURL=subChannel.d.ts.map