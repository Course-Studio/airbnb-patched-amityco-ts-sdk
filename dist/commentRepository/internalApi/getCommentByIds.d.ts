export declare const getCommentByIds: {
    (commentIds: Amity.InternalComment["commentId"][]): Promise<Amity.Cached<Amity.InternalComment[]>>;
    locally(commentIds: Amity.InternalComment["commentId"][]): Amity.Cached<Amity.InternalComment[]> | undefined;
};
