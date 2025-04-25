export declare const queryFollows: {
    (key: 'followers' | 'following', query: {
        userId: Amity.InternalUser['userId'];
        status?: Exclude<Amity.FollowStatusType, 'none'>;
        page?: Amity.PageRaw;
    }): Promise<Amity.Cached<Amity.Paged<Amity.FollowStatus, Amity.PageRaw>>>;
    locally(key: Parameters<typeof queryFollows>[0], query: Parameters<typeof queryFollows>[1]): Amity.Cached<Amity.Paged<Amity.FollowStatus, Amity.PageRaw>> | undefined;
};
