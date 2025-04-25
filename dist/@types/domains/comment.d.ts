export {};
declare global {
    namespace Amity {
        type CommentContentType = 'text';
        type CommentReferenceType = 'content' | 'post' | 'story';
        type CommentActionType = 'onFetch' | 'onCreate' | 'onUpdate' | 'onDelete' | 'onFlagged' | 'onUnflagged' | 'onReactionAdded' | 'onReactionRemoved';
        type RawComment<T extends CommentContentType = any> = {
            commentId: string;
            userId: string;
            parentId?: RawComment['commentId'];
            rootId: RawComment['commentId'];
            childrenNumber: number;
            children: RawComment['commentId'][];
            segmentNumber: number;
            editedAt: Amity.timestamp;
            attachments?: Amity.Attachment[];
            targetId: string;
            targetType: 'community' | 'user' | 'content';
        } & Amity.Relationship<CommentReferenceType> & Amity.Content<T> & Amity.Metadata & Amity.Flaggable & Amity.Reactable & Amity.Timestamps & Amity.SoftDelete & Amity.Subscribable & Amity.Mentionable<'user'>;
        type InternalComment<T extends CommentContentType = any> = RawComment<T>;
        type CommentTarget = {
            type: InternalComment['targetType'] | 'unknown';
            communityId?: Amity.Community['communityId'];
            userId?: Amity.InternalUser['userId'];
            contentId?: string;
            creatorMember?: Amity.Membership<'community'>;
        };
        type Comment<T extends CommentContentType = any> = Amity.InternalComment<T> & {
            target: Amity.CommentTarget;
            creator?: Amity.User;
        };
        type QueryComments = {
            referenceType: Amity.InternalComment['referenceType'];
            referenceId: Amity.InternalComment['referenceId'];
            sortBy?: 'lastCreated' | 'firstCreated' | 'lastUpdated' | 'firstUpdated';
            parentId?: Amity.InternalComment['commentId'] | null;
            hasFlag?: boolean;
            includeDeleted?: boolean;
            limit?: number;
            page?: Amity.Token;
            dataTypes?: {
                values: ('image' | 'text')[];
                matchType: 'any' | 'exact';
            };
        };
        type CommentLiveCollection = Amity.LiveCollectionParams<Omit<QueryComments, 'sortBy' | 'page'> & {
            sortBy?: 'lastCreated' | 'firstCreated';
        }>;
        type CommentLiveCollectionCache = Amity.LiveCollectionCache<Amity.InternalComment['commentId'], {
            page?: Amity.Token | undefined;
            limit?: number;
        }>;
    }
}
//# sourceMappingURL=comment.d.ts.map