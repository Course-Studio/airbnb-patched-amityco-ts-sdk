export declare const generateFollows: (blockUser: Amity.InternalUser, status: Exclude<Amity.FollowStatusType, 'all'>) => Amity.FollowStatus;
export declare const follow11: Amity.FollowStatus;
export declare const follow12: Amity.FollowStatus;
export declare const follow13: Amity.FollowStatus;
export declare const follow21: Amity.FollowStatus;
export declare const follow22: Amity.FollowStatus;
export declare const follow23: Amity.FollowStatus;
export declare const follows: {
    userId: string;
    page1: Amity.RawFollowStatus[];
    page2: Amity.RawFollowStatus[];
};
export declare const followPayload: Amity.FollowersPayload;
