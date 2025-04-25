import { PaginationController } from '~/core/liveCollection/PaginationController';
export declare class BlockedUserPaginationController extends PaginationController<'blockUser', Amity.BlockedUsersLiveCollection> {
    getRequest(queryParams: Amity.BlockedUsersLiveCollection, token: string | undefined): Promise<Amity.FollowStatusPayload & Amity.UserPayload & Amity.Pagination>;
}
//# sourceMappingURL=BlockedUserPaginationController.d.ts.map