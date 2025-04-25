import { PaginationController } from '~/core/liveCollection/PaginationController';
/**
 * TODO: handle cache receive cache option, and cache policy
 * TODO: check if querybyIds is supported
 */
export declare class CommunityMembersPaginationController extends PaginationController<'communityUser', Amity.CommunityMemberLiveCollection> {
    getRequest(queryParams: Amity.CommunityMemberLiveCollection, token: string | undefined): Promise<Amity.CommunityMembershipPayload & Amity.Pagination>;
}
