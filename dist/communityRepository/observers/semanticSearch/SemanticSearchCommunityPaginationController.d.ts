import { PaginationController } from '~/core/liveCollection/PaginationController';
export declare class SemanticSearchCommunityPaginationController extends PaginationController<'semanticSearchCommunity', Amity.SemanticSearchCommunityLiveCollection> {
    getRequest(queryParams: Amity.SemanticSearchCommunityLiveCollection, token: string | undefined): Promise<Amity.CommunityPayload & {
        searchResult: {
            communityId: string;
            score: number;
        }[];
    } & Amity.Pagination>;
}
//# sourceMappingURL=SemanticSearchCommunityPaginationController.d.ts.map