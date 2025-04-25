export {};
declare global {
    namespace Amity {
        const enum AnalyticEventActivityType {
            View = "view",
            Click = "linkClicked"
        }
        const enum AnalyticEventContentType {
            Post = "post",
            Story = "story",
            Ad = "ad"
        }
        type AnalyticEventModel = {
            contentId: Amity.InternalPost['postId'];
            contentType: AnalyticEventContentType;
            activityType: AnalyticEventActivityType;
            timestamp: Amity.timestamp;
            metadata?: Record<string, string>;
        };
        type AnalyticPostData = {
            impression: number;
            reach: number;
        };
        type QueryPostViewedUser = {
            token?: Amity.Token;
            limit?: Amity.PageLimit['limit'];
        };
        type ViewedUsersLiveCollection = {
            viewedType: ValueOf<typeof AnalyticEventContentType>;
            viewId: Amity.Post['postId'] | Amity.Story['storyId'];
        } & Amity.LiveCollectionParams<QueryPostViewedUser>;
        type PostViewedUsersLiveCollectionCache = Amity.LiveCollectionCache<Amity.User['userId'], {
            page?: {
                next?: Amity.Token;
                previous?: Amity.Token;
            };
        }>;
    }
}
