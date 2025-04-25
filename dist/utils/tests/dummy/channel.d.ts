export declare const convertChannelFromRaw: (channel: Amity.RawChannel) => Amity.InternalChannel;
export declare const convertRawChannelPayload: (rawPayload: Amity.ChannelPayload) => Amity.ProcessedChannelPayload;
export declare function generateRawChannel(params?: Partial<Amity.RawChannel>): Amity.RawChannel;
export declare function generateRawChannelUser(params?: Partial<Amity.RawMembership<'channel'>>): Amity.RawMembership<'channel'>;
export declare const convertChannelUserFromRaw: (member: Amity.RawMembership<'channel'>, user: Amity.InternalUser | undefined) => Amity.Membership<'channel'>;
export declare const mockPage: {
    paging: {
        previous: string;
        next: string;
    };
};
export declare const channelRaw1: Amity.RawChannel;
export declare const channelRawLive1: Amity.RawChannel;
export declare const channelRawConversation1: Amity.RawChannel;
export declare const channelRawWithNoMessgePreviewConversation1: Amity.RawChannel;
export declare const channelRawWithMessgePreviewConversation1: Amity.RawChannel;
export declare const channelRaw2: Amity.RawChannel;
export declare const channelRaw3: Amity.RawChannel;
export declare const channelModel1: Amity.InternalChannel;
export declare const channelModel2: Amity.InternalChannel;
export declare const channel1: Amity.Channel;
export declare const channel2: Amity.Channel;
export declare const rawChannelUser: Amity.RawMembership<"channel">;
export declare const channelUser: Amity.Membership<"channel">;
export declare const rawChannelUser2: Amity.RawMembership<"channel">;
export declare const channelUser2: Amity.Membership<"channel">;
export declare const rawChannelUser3: Amity.RawMembership<"channel">;
export declare const channelUser3: Amity.Membership<"channel">;
export declare const channelUser4: Amity.RawMembership<"channel">;
export declare const rawBannedChannelUser: Amity.RawMembership<"channel">;
export declare const bannedChannelUser: Amity.Membership<"channel">;
export declare const rawMutedChannelUser: Amity.RawMembership<"channel">;
export declare const mutedChannelUser: Amity.Membership<"channel">;
export declare const rawChannelUserWithRole: Amity.RawMembership<"channel">;
export declare const channelUserWithRole: Amity.Membership<"channel">;
export declare const channelQueryResponse: {
    data: {
        paging: {
            previous: string;
            next: string;
        };
        channels: Amity.RawChannel<any>[];
        channelUsers: any[];
        files: any[];
        users: any[];
        messagePreviews: any[];
    };
};
export declare const channelQueryResponseWithoutPaging: {
    data: {
        channels: Amity.RawChannel<any>[];
        channelUsers: any[];
        files: any[];
        users: any[];
        messagePreviews: any[];
    };
};
export declare const channelGetResponseWithMessagePreview: {
    data: {
        channels: Amity.RawChannel<any>[];
        channelUsers: any[];
        files: any[];
        users: Amity.User[];
        messagePreviews: Amity.MessagePreviewPayload<any>[];
        messageFeedsInfo: Amity.messageFeedsInfoPayload[];
    };
};
export declare const channelGetResponseWithNoMessagePreview: {
    data: {
        channels: Amity.RawChannel<any>[];
        channelUsers: any[];
        files: any[];
        users: Amity.User[];
        messagePreviews: any[];
        messageFeedsInfo: any[];
    };
};
export declare const channelQueryResponseWithMessagePreview: {
    data: {
        paging: {
            previous: string;
            next: string;
        };
        channels: Amity.RawChannel<any>[];
        channelUsers: any[];
        files: any[];
        users: Amity.User[];
        messagePreviews: Amity.MessagePreviewPayload<any>[];
        messageFeedsInfo: Amity.messageFeedsInfoPayload[];
    };
};
export declare const channelQueryResponseWithNoMessagePreview: {
    data: {
        paging: {
            previous: string;
            next: string;
        };
        channels: Amity.RawChannel<any>[];
        channelUsers: any[];
        files: any[];
        users: Amity.User[];
        messagePreviews: any[];
        messageFeedsInfo: any[];
    };
};
export declare const getChannelsResponse: {
    data: {
        paging: {
            previous: string;
            next: string;
        };
        channels: Amity.RawChannel<any>[];
        channelUsers: any[];
        files: any[];
        users: any[];
        messagePreviews: any[];
    };
};
export declare const channelQueryResponsePage2: {
    data: {
        paging: {
            previous: string;
            next: string;
        };
        channels: Amity.RawChannel<any>[];
        channelUsers: any[];
        files: any[];
        users: any[];
        messagePreviews: any[];
    };
};
export declare const channelTagQueryResponse: {
    data: {
        paging: {
            previous: string;
            next: string;
        };
        channels: Amity.RawChannel<any>[];
        channelUsers: any[];
        files: any[];
        users: any[];
        messagePreviews: any[];
    };
};
export declare const channelExcludeTagQueryResponse: {
    data: {
        paging: {
            previous: string;
            next: string;
        };
        channels: Amity.RawChannel<any>[];
        channelUsers: any[];
        files: any[];
        users: any[];
        messagePreviews: any[];
    };
};
export declare const channelUserQueryResponse: {
    data: {
        paging: {
            previous: string;
            next: string;
        };
        channels: Amity.RawChannel<any>[];
        channelUsers: Amity.RawMembership<"channel">[];
        users: Amity.User[];
        files: any[];
        messagePreviews: any[];
    };
};
export declare const emptyChannelUserQueryResponse: {
    data: {
        paging: {
            previous: string;
            next: string;
        };
        channels: Amity.RawChannel<any>[];
        channelUsers: any[];
        users: any[];
        files: any[];
        messagePreviews: any[];
    };
};
export declare const channelUserModel: Amity.Membership<"channel">[];
export declare const channelUserQueryResponsePage2: {
    data: {
        paging: {
            previous: string;
            next: string;
        };
        channels: Amity.RawChannel<any>[];
        channelUsers: Amity.RawMembership<"channel">[];
        users: Amity.User[];
        files: any[];
        messagePreviews: any[];
    };
};
export declare const channelUserQueryResponsePage3: {
    data: {
        paging: {
            previous: string;
            next: string;
        };
        channels: Amity.RawChannel<any>[];
        channelUsers: Amity.RawMembership<"channel">[];
        users: Amity.User[];
        files: any[];
        messagePreviews: any[];
    };
};
export declare const rawChannelPayload: Amity.ChannelPayload;
export declare const channelPayload: Amity.ProcessedChannelPayload;
export declare const liveChannelPayload: {
    channels: Amity.RawChannel<any>[];
    channelUsers: Amity.RawMembership<"channel">[];
    users: Amity.User[];
    files: Amity.File<"image">[];
    messagePreviews: any[];
};
export declare const conversationChannelPayload: {
    channels: Amity.RawChannel<any>[];
    channelUsers: Amity.RawMembership<"channel">[];
    users: Amity.User[];
    files: Amity.File<"image">[];
    messagePreviews: any[];
};
export declare const channelDisplayName1: Amity.RawChannel<any>;
export declare const channelDisplayName2: Amity.RawChannel<any>;
export declare const channelDisplayName3: Amity.RawChannel<any>;
export declare const channelDisplayName4: Amity.RawChannel<any>;
export declare const channelCreatedAt1: Amity.RawChannel<any>;
export declare const channelCreatedAt2: Amity.RawChannel<any>;
export declare const channelCreatedAt3: Amity.RawChannel<any>;
export declare const channelLastActivity1: Amity.RawChannel<any>;
export declare const channelLastActivity2: Amity.RawChannel<any>;
export declare const channelLastActivity3: Amity.RawChannel<any>;
