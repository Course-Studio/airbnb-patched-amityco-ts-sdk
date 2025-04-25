import { PaginationController } from '~/core/liveCollection/PaginationController';
export declare class SearchUserPaginationController extends PaginationController<'user', Amity.SearchUserLiveCollection> {
    getRequest(queryParams: Amity.SearchUserLiveCollection, token: string | undefined): Promise<Amity.UserPayload & Amity.Pagination>;
}
//# sourceMappingURL=SearchUserPaginationController.d.ts.map