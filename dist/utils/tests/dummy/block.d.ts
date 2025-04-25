export declare const generateFollowCount: (user: Amity.InternalUser) => {
    userId: string;
    followingCount: number;
    followerCount: number;
    pendingCount: number;
};
export declare const generateBlockResult: (blockUser: Amity.InternalUser, status: Exclude<Amity.FollowStatusType, 'all'>) => {
    data: {
        follows: Amity.RawFollowStatus[];
        followCounts: {
            userId: string;
            followingCount: number;
            followerCount: number;
            pendingCount: number;
        }[];
    };
};
export declare const generateBlockedUsers: (...blockedUser: Amity.InternalUser[]) => {
    data: {
        users: Amity.InternalUser[];
        files: any[];
        follows: Amity.RawFollowStatus[];
        paging: {
            total: number;
        };
    };
};
