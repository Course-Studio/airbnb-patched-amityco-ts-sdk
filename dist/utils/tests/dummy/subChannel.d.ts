export declare function generateRawSubChannel(params?: Partial<Amity.RawSubChannel>): Amity.RawSubChannel;
export declare const convertSubChannelFromRaw: (subChannel: Amity.RawSubChannel) => Amity.SubChannel;
export declare function generateSubChannel(params?: Record<string, any>): Amity.SubChannel;
export declare function generateRawMessagePreviewSubChannel(params: Partial<Amity.SubChannelMessagePreviewPayload>): {
    channelId: string;
    channelPublicId: string;
    channelType: string;
    childCount: number;
    creatorId: string;
    creatorPublicId: string;
    data: string | Record<string, unknown>;
    dataType: any;
    isDeleted: boolean;
    mentionedUsers?: (Amity.ChannelMention | Amity.UserMention)[] | undefined;
    messageFeedId: string;
    messageId: string;
    parentId: string;
    path: string;
    segment: number;
    dataTypes?: any[] | undefined;
    flagCount: number;
    hashFlag?: {
        bits: number;
        hashes: number;
        hash: string;
    } | null | undefined;
    tags?: string[] | undefined;
    createdAt: string;
    updatedAt: string;
    hashFlagged: null;
    reactionCount: number;
};
//# sourceMappingURL=subChannel.d.ts.map