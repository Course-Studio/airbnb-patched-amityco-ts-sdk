import { PaginationController } from '~/core/liveCollection/PaginationController';
/**
 * TODO: handle cache receive cache option, and cache policy
 * TODO: check if querybyIds is supported
 */
export declare class SearchCommunityMembersPaginationController extends PaginationController<'communityUser', Amity.SearchCommunityMemberLiveCollection> {
    getRequest(queryParams: Amity.SearchCommunityMemberLiveCollection, token: string | undefined): Promise<Amity.CommunityMembershipPayload & Amity.Pagination>;
}
