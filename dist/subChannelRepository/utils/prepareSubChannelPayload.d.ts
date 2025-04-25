export declare const MARKER_INCLUDED_SUB_CHANNEL_TYPE: string[];
/**
 * Filter sub channel by type. Only conversation, community and broadcast type are included.
 */
export declare const isUnreadCountSupport: ({ channelType }: Pick<Amity.RawSubChannel, 'channelType'>) => boolean;
export declare const preUpdateSubChannelCache: (rawPayload: Amity.SubChannelPayload) => void;
export declare const prepareSubChannelPayload: (rawPayload: Amity.SubChannelPayload) => Promise<Amity.ProcessedSubChannelPayload>;
declare type RawQuerySubChannels = Omit<Amity.QuerySubChannels, 'excludeDefaultSubChannel'> & {
    excludeDefaultMessageFeed?: Amity.QuerySubChannels['excludeDefaultSubChannel'];
};
export declare function convertQueryParams({ excludeDefaultSubChannel, ...rest }: Amity.QuerySubChannels): RawQuerySubChannels;
export {};
//# sourceMappingURL=prepareSubChannelPayload.d.ts.map