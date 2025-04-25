export declare const PostContentType: Readonly<{
    TEXT: "text";
    IMAGE: "image";
    FILE: "file";
    VIDEO: "video";
    LIVESTREAM: "liveStream";
    POLL: "poll";
}>;
declare global {
    namespace Amity {
        type PostTargetType = Amity.Feed['targetType'] | 'content';
        type PostContentType = ValueOf<typeof PostContentType> | string;
        type PostActionType = 'onFetch' | 'onCreate' | 'onUpdate' | 'onDelete' | 'onApproved' | 'onDeclined' | 'onFlagged' | 'onUnflagged' | 'onReactionAdded' | 'onReactionRemoved';
        type RawPost<T extends PostContentType = any> = {
            postId: string;
            postedUserId: Amity.RawUser['userId'];
            parentId: Amity.RawPost['postId'];
            parentPostId: Amity.RawPost['postId'];
            targetType: PostTargetType;
            targetId: string;
            feedId: Amity.Feed['feedId'];
            children: Amity.RawPost['postId'][];
            comments: Amity.InternalComment['commentId'][];
            commentsCount: number;
            hasFlaggedChildren: false;
            hasFlaggedComment: false;
            editedAt: Amity.timestamp;
        } & Amity.Content<T> & Amity.Metadata & Amity.Flaggable & Amity.Reactable & Amity.Taggable & Amity.Timestamps & Amity.SoftDelete & Amity.Subscribable & Amity.AnalyticPostData & Amity.Mentionable<'user'>;
        type InternalPost<T extends PostContentType = any> = RawPost<T> & {
            feedType?: 'reviewing' | 'published';
        };
        type PostLinkObject = {
            latestComments: (Amity.Comment | null)[];
            creator: Amity.User | undefined;
            analytics: {
                markAsViewed: () => void;
            };
        };
        type Post<T extends PostContentType = any> = Amity.InternalPost<T> & Amity.PostLinkObject;
        type QueryPosts = {
            targetId: string;
            targetType: Amity.InternalPost['targetType'];
            sortBy?: 'lastCreated' | 'firstCreated';
            dataTypes?: Exclude<Amity.PostContentType, 'text'>[];
            includeDeleted?: boolean;
            hasFlag?: boolean;
            feedType?: 'reviewing' | 'published';
            tags?: Amity.Taggable['tags'];
            matchingOnlyParentPost?: boolean;
            page?: string;
            limit?: number;
        };
        type PostLiveCollection = Amity.LiveCollectionParams<Omit<QueryPosts, 'sortBy' | 'page'> & {
            sortBy?: 'lastCreated' | 'firstCreated';
        }>;
        type PostLiveCollectionCache = Amity.LiveCollectionCache<Amity.InternalPost['postId'], Pick<QueryPosts, 'page'>>;
        type QuerySemanticSearchPosts = {
            query: string;
            targetId?: string;
            targetType?: Amity.InternalPost['targetType'];
            dataTypes?: string[];
            matchingOnlyParentPost?: boolean;
        };
        type SemanticSearchPostLiveCollection = Amity.LiveCollectionParams<Omit<QuerySemanticSearchPosts, 'page'>>;
        type SemanticSearchPostLiveCollectionCache = Amity.LiveCollectionCache<Amity.InternalPost['postId'], // postId:score
        QuerySemanticSearchPosts>;
    }
}
