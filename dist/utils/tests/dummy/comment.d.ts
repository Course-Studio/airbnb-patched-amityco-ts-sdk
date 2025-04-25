import { createComment } from '~/commentRepository/api';
export declare function generateInternalComment(params?: Partial<Amity.InternalComment>): Amity.InternalComment;
export declare const generateComment: (params?: Partial<Amity.InternalComment>) => {
    creator: Amity.User;
    childrenComment: any[];
    target: {
        type: string;
        communityId: string;
        creatorMember: Amity.Membership<"community">;
    };
    commentId: string;
    userId: string;
    parentId?: Amity.RawComment["commentId"];
    rootId: Amity.RawComment["commentId"];
    childrenNumber: number;
    children: Amity.RawComment["commentId"][];
    segmentNumber: number;
    editedAt: Amity.timestamp;
    attachments?: Amity.Attachment[];
    targetId: string;
    targetType: "community" | "user" | "content";
    referenceId: string;
    referenceType: Amity.CommentReferenceType;
    dataType?: any;
    dataTypes?: any[];
    data?: string | Record<string, unknown> | Amity.ContentDataText | Amity.ContentDataFile | Amity.ContentDataImage | Amity.ContentDataVideo | Amity.ContentDataPoll;
    metadata?: Record<string, any>;
    flagCount: number;
    hashFlag: {
        bits: number;
        hashes: number;
        hash: string;
    } | null;
    reactionsCount: number;
    reactions: Record<string, number>;
    myReactions?: string[];
    createdAt: Amity.timestamp;
    updatedAt?: Amity.timestamp;
    deletedAt?: Amity.timestamp;
    isDeleted?: boolean;
    path: string;
    mentionees?: Amity.UserMention[];
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
        files: any[];
        commentChildren: any[];
        paging: {};
        comments: Amity.InternalComment<any>[];
        users: Amity.InternalUser[];
        communityUsers: Amity.Membership<"community">[];
    };
};
export declare const imageCommentResponse: {
    data: {
        files: any[];
        commentChildren: any[];
        paging: {};
        comments: Amity.InternalComment<any>[];
        users: Amity.InternalUser[];
        communityUsers: Amity.Membership<"community">[];
    };
};
export declare const textImageCommentResponse: {
    data: {
        files: any[];
        commentChildren: any[];
        paging: {};
        comments: Amity.InternalComment<any>[];
        users: Amity.InternalUser[];
        communityUsers: Amity.Membership<"community">[];
    };
};
export declare const textMentionCommentResponse: {
    data: {
        files: any[];
        commentChildren: any[];
        paging: {};
        comments: Amity.InternalComment<any>[];
        users: Amity.InternalUser[];
        communityUsers: Amity.Membership<"community">[];
    };
};
export declare const textCommentParentIdResponse: {
    data: {
        files: any[];
        commentChildren: any[];
        paging: {};
        comments: Amity.InternalComment<any>[];
        users: Amity.InternalUser[];
        communityUsers: Amity.Membership<"community">[];
    };
};
export declare const deletedCommentResponse: {
    data: {
        files: any[];
        commentChildren: any[];
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
