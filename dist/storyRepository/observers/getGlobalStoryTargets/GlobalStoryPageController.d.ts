import { PaginationController } from '~/core/liveCollection/PaginationController';
type GlobalStoryFeedResult = Amity.GlobalStoryFeedPayload & Amity.Pagination;
export declare class GlobalStoryPageController extends PaginationController<'globalStoryFeed', Amity.LiveCollectionParams<Amity.StoryGlobalQuery>> {
    private smartFilterState;
    getRequest(queryParams: Amity.LiveCollectionParams<Amity.StoryGlobalQuery>, token: string | undefined): Promise<GlobalStoryFeedResult>;
    createRequest(params: {
        seenState: Amity.StorySeenQuery;
        limit: number;
        token?: string;
    }): Promise<GlobalStoryFeedResult>;
}
export {};
