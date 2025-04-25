export declare function generateInternalPost(params?: Partial<Amity.InternalPost>): Amity.InternalPost;
export declare function generatePost(params?: Partial<Amity.Post>): Amity.Post;
export declare const post11: Amity.Post;
export declare const post12: Amity.Post;
export declare const post13: Amity.Post;
export declare const post14: Amity.Post;
export declare const post15: Amity.Post;
export declare const post16: Amity.Post;
export declare const internalPost11: Amity.InternalPost;
export declare const internalPost12: Amity.InternalPost;
export declare const internalPost13: Amity.InternalPost;
export declare const posts: {
    targetId: string;
    targetType: Amity.PostTargetType;
    page1: string[];
    page2: string[];
    page3: string[];
};
export declare const emptyPostPayload: {
    posts: never[];
    postChildren: never[];
    communities: never[];
    communityUsers: never[];
    categories: never[];
    comments: never[];
    feeds: never[];
    users: never[];
    files: never[];
};
export declare const postQueryResponse: {
    data: Omit<Amity.PostPayload<any>, "communityUsers" | "communities" | "posts"> & {
        posts: Amity.InternalPost<any>[];
        communities: Amity.Community[];
        communityUsers: Amity.Membership<"community">[];
    } & Amity.Pagination;
};
export declare const postQueryResponse2: {
    data: Omit<Amity.PostPayload<any>, "communityUsers" | "communities" | "posts"> & {
        posts: Amity.InternalPost<any>[];
        communities: Amity.Community[];
        communityUsers: Amity.Membership<"community">[];
    } & Amity.Pagination;
};
export declare const postQueryResponsePage2: {
    data: Omit<Amity.PostPayload<any>, "communityUsers" | "communities" | "posts"> & {
        posts: Amity.InternalPost<any>[];
        communities: Amity.Community[];
        communityUsers: Amity.Membership<"community">[];
    } & Amity.Pagination;
};
//# sourceMappingURL=post.d.ts.map