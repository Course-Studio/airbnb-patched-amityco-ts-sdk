export declare const baseCommunity: Amity.Community;
export declare const community11: Amity.Community;
export declare const community21: Amity.Community;
export declare const communityUser11: Amity.RawMembership<'community'>;
export declare const convertedCommunityUser1: Amity.Membership<"community">;
export declare const communityUser12: Amity.RawMembership<'community'>;
export declare const convertedCommunityUser2: Amity.Membership<"community">;
export declare const communityUser13: Amity.RawMembership<'community'>;
export declare const convertedCommunityUser3: Amity.Membership<"community">;
export declare const communityUser21: Amity.RawMembership<'community'>;
export declare const withRoleCommunityUser: Amity.Membership<"community">;
export declare const communityUser22: Amity.RawMembership<'community'>;
export declare const bannedCommunityUser: Amity.Membership<"community">;
export declare const emptyCommunityPayload: {
    communities: any[];
    communityUsers: any[];
    categories: any[];
    feeds: any[];
    users: any[];
    files: any[];
};
export declare const communityPayload: Amity.CommunityPayload;
export declare const communityUserQueryResponse: {
    data: {
        paging: {
            previous?: Amity.Token;
            next?: Amity.Token;
        };
        communities: Amity.Community[];
        communityUsers: Amity.RawMembership<"community">[];
        users: Amity.User[];
        files: any[];
        categories: any[];
        feeds: any[];
    };
};
export declare const communityUserQueryResponsePage2: {
    data: {
        paging: {
            previous?: Amity.Token;
            next?: Amity.Token;
        };
        communities: Amity.Community[];
        communityUsers: Amity.RawMembership<"community">[];
        users: Amity.User[];
        files: any[];
        categories: any[];
        feeds: any[];
    };
};
export declare const communityUserModel: {
    user: Amity.User;
    isBanned: boolean;
    isMuted: boolean;
    muteTimeout: string;
    lastActivity: Amity.timestamp;
    userId: Amity.InternalUser["userId"];
    communityId: Amity.Community["communityId"];
    communityMembership: Amity.GroupMembership;
    createdAt: Amity.timestamp;
    updatedAt?: Amity.timestamp;
    roles: Amity.Role["displayName"][];
    permissions: Amity.Permission[];
}[];
export declare const communityRaw1: {
    path: string;
    isOfficial: boolean;
    isPublic: boolean;
    onlyAdminCanPost: boolean;
    postsCount: number;
    membersCount: number;
    moderatorMemberCount: number;
    updatedAt: string;
    createdAt: string;
    isDeleted: boolean;
    needApprovalOnPostCreation: boolean;
    displayName: string;
    tags: string[];
    metadata: {};
    hasFlaggedComment: boolean;
    hasFlaggedPost: boolean;
    communityId: string;
    channelId: string;
    userId: string;
    isJoined: boolean;
    avatarFileId: string;
    categoryIds: string[];
};
export declare const communityRaw2: {
    path: string;
    isOfficial: boolean;
    isPublic: boolean;
    onlyAdminCanPost: boolean;
    postsCount: number;
    membersCount: number;
    moderatorMemberCount: number;
    updatedAt: string;
    createdAt: string;
    isDeleted: boolean;
    needApprovalOnPostCreation: boolean;
    displayName: string;
    tags: any[];
    metadata: {};
    hasFlaggedComment: boolean;
    hasFlaggedPost: boolean;
    communityId: string;
    channelId: string;
    userId: string;
    isJoined: boolean;
    avatarFileId: string;
    categoryIds: any[];
};
export declare const communityQueryResponse: {
    data: Amity.CommunityPayload & Amity.Pagination;
};
export declare const communityQueryResponsePage2: {
    data: Amity.CommunityPayload & Amity.Pagination;
};
