import { PaginationController } from '~/core/liveCollection/PaginationController';
export declare class FollowingPaginationController extends PaginationController<'follower', Amity.FollowingLiveCollection> {
    getRequest(queryParams: Amity.FollowingLiveCollection, token: string | undefined): Promise<Amity.FollowStatusPayload & Amity.UserPayload & Amity.Pagination>;
}
