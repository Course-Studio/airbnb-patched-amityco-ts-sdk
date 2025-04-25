export declare const convertToInternalComment: (commentPayload: Amity.CommentPayload) => {
    comments: Amity.InternalComment<any>[];
    commentChildren: Amity.InternalComment[];
    users: Amity.InternalUser[];
    files: Amity.File[];
    communityUsers: Amity.Membership<"community">[];
};
