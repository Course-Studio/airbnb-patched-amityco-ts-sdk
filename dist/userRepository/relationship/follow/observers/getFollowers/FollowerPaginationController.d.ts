import { PaginationController } from '~/core/liveCollection/PaginationController';
export declare class FollowerPaginationController extends PaginationController<'follower', Amity.FollowerLiveCollection> {
    getRequest(queryParams: Amity.FollowerLiveCollection, token: string | undefined): Promise<Amity.FollowStatusPayload & Amity.UserPayload & Amity.Pagination>;
}
//# sourceMappingURL=FollowerPaginationController.d.ts.map