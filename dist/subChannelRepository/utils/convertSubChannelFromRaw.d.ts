export declare const MARKER_INCLUDED_SUB_CHANNEL_TYPE: string[];
export declare const isUnreadCountSupport: ({ channelType }: Pick<Amity.RawSubChannel, 'channelType'>) => boolean;
export declare function convertFromRaw({ channelId, channelPublicId, channelType, childCount, creatorId, creatorPublicId, lastMessageId, lastMessageTimestamp, messageFeedId, name, ...rest }: Amity.RawSubChannel): Amity.SubChannel;
