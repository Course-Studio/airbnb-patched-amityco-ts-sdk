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
    posts: any[];
    postChildren: any[];
    communities: any[];
    communityUsers: any[];
    categories: any[];
    comments: any[];
    feeds: any[];
    users: any[];
    files: any[];
};
export declare const postQueryResponse: {
    data: Amity.ProcessedPostPayload & Amity.Pagination;
};
export declare const postQueryResponse2: {
    data: Amity.ProcessedPostPayload & Amity.Pagination;
};
export declare const postQueryResponsePage2: {
    data: Amity.ProcessedPostPayload & Amity.Pagination;
};
