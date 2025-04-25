export declare function convertFromRaw(message: Amity.RawMessage, reactors?: Amity.InternalReactor[], event?: keyof Amity.MqttMessageEvents): Amity.InternalMessage;
export declare const prepareMessagePayload: (payload: Amity.MessagePayload, event?: keyof Amity.MqttMessageEvents) => Promise<Amity.ProcessedMessagePayload>;
declare type RawQueryMessages = Omit<Amity.QueryMessages, 'page' | 'sortBy' | 'subChannelId' | 'tags' | 'includeDeleted' | 'aroundMessageId' | 'dataType' | 'includingTags' | 'excludingTags'> & {
    includeTags?: Amity.QueryMessages['includingTags'];
    excludeTags?: Amity.QueryMessages['excludingTags'];
    isDeleted?: Amity.Message['isDeleted'];
    messageFeedId: Amity.QueryMessages['subChannelId'];
    dataType?: Amity.MessageContentType;
    options: {
        sortBy?: Amity.QueryMessages['sortBy'];
        token?: string;
        limit?: number;
        around?: Amity.Message['messageId'];
    };
};
export declare function convertParams({ subChannelId, mentionees, dataType, data, ...rest }: Partial<Amity.Message>): Record<string, any>;
export declare function convertQueryParams({ sortBy, subChannelId, includingTags, excludingTags, includeDeleted, aroundMessageId, limit, type, ...rest }: Amity.MessagesLiveCollection): RawQueryMessages;
export {};
//# sourceMappingURL=prepareMessagePayload.d.ts.map