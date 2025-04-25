export declare const MARKER_INCLUDED_CHANNEL_TYPE: string[];
export declare const isUnreadCountSupport: ({ type }: Pick<Amity.RawChannel, 'type'>) => boolean;
export declare function convertFromRaw(channel: Amity.RawChannel, options?: {
    isMessagePreviewUpdated?: boolean;
}): Amity.StaticInternalChannel;
export declare const preUpdateChannelCache: (rawPayload: Amity.ChannelPayload, options?: {
    isMessagePreviewUpdated?: boolean;
}) => void;
export declare const prepareChannelPayload: (rawPayload: Amity.ChannelPayload, options?: {
    isMessagePreviewUpdated?: boolean;
}) => Promise<Amity.ProcessedChannelPayload>;
