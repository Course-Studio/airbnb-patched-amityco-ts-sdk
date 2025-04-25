import { PaginationController } from '~/core/liveCollection/PaginationController';
export declare class UserPaginationController extends PaginationController<'user', Amity.UserLiveCollection> {
    getRequest(queryParams: Amity.UserLiveCollection, token: string | undefined): Promise<Amity.UserPayload & Amity.Pagination>;
}
