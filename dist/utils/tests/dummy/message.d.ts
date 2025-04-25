export declare function generateRawMessage(params?: Partial<Amity.RawMessage>): Amity.RawMessage;
export declare const convertRawMessage: ({ channelPublicId, childCount, creatorPublicId, mentionedUsers, messageFeedId, reactionCount, reactions, referenceId, segment, messageId, myReactions, creatorId, ...rest }: Amity.RawMessage) => Amity.InternalMessage;
export declare const withLinkedObject: (message: Amity.InternalMessage) => Amity.Message;
export declare const convertRawMessagePayload: (rawPayload: Amity.MessagePayload) => Amity.ProcessedMessagePayload;
export declare const message11: Amity.InternalMessage;
export declare const messages: {
    subChannelId: string;
    page1: string[];
    page2: string[];
    page3: string[];
    page4: string[];
};
export declare const messagesDesc: {
    subChannelId: string;
    page1: string[];
    page2: string[];
    page3: string[];
};
export declare const messageQueryResponse: {
    data: {
        messages: Amity.InternalMessage<any>[];
        files: never[];
        users: never[];
        paging: {
            previous: string;
            next: string;
        };
    };
};
export declare const messagePayload: {
    messages: Amity.InternalMessage<any>[];
    files: Amity.File<"image">[];
    users: Amity.User[];
};
//# sourceMappingURL=message.d.ts.map