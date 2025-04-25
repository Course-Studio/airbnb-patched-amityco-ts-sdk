import { PaginationController } from '~/core/liveCollection/PaginationController';
export declare class SemanticSearchPostPaginationController extends PaginationController<'semanticSearchPost', Amity.SemanticSearchPostLiveCollection> {
    getRequest(queryParams: Amity.SemanticSearchPostLiveCollection, token: string | undefined): Promise<Amity.PostPayload<any> & {
        searchResult: {
            postId: string;
            score: number;
        }[];
        polls: Amity.RawPoll[];
    } & Amity.Pagination>;
}
//# sourceMappingURL=SemanticSearchPostPaginationController.d.ts.map