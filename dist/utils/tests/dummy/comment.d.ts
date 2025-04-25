import { createComment } from '~/commentRepository/api';
export declare function generateInternalComment(params?: Partial<Amity.InternalComment>): Amity.InternalComment;
export declare const generateComment: (params?: Partial<Amity.InternalComment>) => {
    creator: Amity.User;
    childrenComment: never[];
    target: {
        type: string;
        communityId: string;
        creatorMember: Amity.Membership<"community">;
    };
    commentId: string;
    userId: string;
    parentId?: string | undefined;
    rootId: string;
    childrenNumber: number;
    children: string[];
    segmentNumber: number;
    editedAt: string;
    attachments?: Amity.Attachment[] | undefined;
    targetId: string;
    targetType: "community" | "user" | "content";
    referenceId: string;
    referenceType: Amity.CommentReferenceType;
    dataType?: any;
    dataTypes?: any[] | undefined;
    data?: string | Record<string, unknown> | Amity.ContentDataText | Amity.ContentDataFile | Amity.ContentDataImage | Amity.ContentDataVideo | Amity.ContentDataPoll | undefined;
    metadata?: Record<string, any> | undefined;
    flagCount: number;
    hashFlag: {
        bits: number;
        hashes: number;
        hash: string;
    } | null;
    reactionsCount: number;
    reactions: Record<string, number>;
    myReactions?: string[] | undefined;
    createdAt: string;
    updatedAt?: string | undefined;
    deletedAt?: string | undefined;
    isDeleted?: boolean | undefined;
    path: string;
    mentionees?: Amity.UserMention[] | undefined;
};
export declare const comment11: Amity.InternalComment;
export declare const imageComment11: Amity.InternalComment;
export declare const textImageComment11: Amity.InternalComment;
export declare const textMentionComment11: Amity.InternalComment;
export declare const comment12: Amity.InternalComment;
export declare const imageComment12: Amity.InternalComment;
export declare const textImageComment12: Amity.InternalComment;
export declare const textCommentPayload: Amity.CommentPayload;
export declare const comment12Payload: Amity.CommentPayload;
export declare const imageCommentPayload: Amity.CommentPayload;
export declare const textImageCommentPayload: Amity.CommentPayload;
export declare const textCommentMentionPayload: Amity.CommentPayload;
export declare const postPayload: Amity.ProcessedPostPayload;
export declare const textAndImageCommentMixedPayload: Amity.CommentPayload;
export declare const deletedCommentPayload: Amity.CommentPayload;
export declare const textCommentResponse: {
    data: {
        files: never[];
        commentChildren: never[];
        paging: {};
        comments: Amity.InternalComment<any>[];
        users: Amity.InternalUser[];
        communityUsers: Amity.Membership<"community">[];
    };
};
export declare const imageCommentResponse: {
    data: {
        files: never[];
        commentChildren: never[];
        paging: {};
        comments: Amity.InternalComment<any>[];
        users: Amity.InternalUser[];
        communityUsers: Amity.Membership<"community">[];
    };
};
export declare const textImageCommentResponse: {
    data: {
        files: never[];
        commentChildren: never[];
        paging: {};
        comments: Amity.InternalComment<any>[];
        users: Amity.InternalUser[];
        communityUsers: Amity.Membership<"community">[];
    };
};
export declare const textMentionCommentResponse: {
    data: {
        files: never[];
        commentChildren: never[];
        paging: {};
        comments: Amity.InternalComment<any>[];
        users: Amity.InternalUser[];
        communityUsers: Amity.Membership<"community">[];
    };
};
export declare const textCommentParentIdResponse: {
    data: {
        files: never[];
        commentChildren: never[];
        paging: {};
        comments: Amity.InternalComment<any>[];
        users: Amity.InternalUser[];
        communityUsers: Amity.Membership<"community">[];
    };
};
export declare const deletedCommentResponse: {
    data: {
        files: never[];
        commentChildren: never[];
        paging: {};
        comments: Amity.InternalComment<any>[];
        users: Amity.InternalUser[];
        communityUsers: Amity.Membership<"community">[];
    };
};
export declare const textCommentRequestPayload: Parameters<typeof createComment>[0];
export declare const textCommentParentIdRequestPayload: Parameters<typeof createComment>[0];
export declare const imageCommentRequestPayload: Parameters<typeof createComment>[0];
export declare const textImageCommentRequestPayload: Parameters<typeof createComment>[0];
export declare const textCommentWithMentionRequestPayload: Parameters<typeof createComment>[0];
//# sourceMappingURL=comment.d.ts.map