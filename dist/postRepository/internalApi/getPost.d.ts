export declare const getPost: {
    (postId: Amity.InternalPost["postId"]): Promise<Amity.Cached<Amity.InternalPost>>;
    locally(postId: Amity.InternalPost["postId"]): Amity.Cached<Amity.InternalPost> | undefined;
};
