import { PaginationController } from '~/core/liveCollection/PaginationController';
/**
 * TODO: handle cache receive cache option, and cache policy
 * TODO: check if querybyIds is supported
 */
export declare class CommunitiesPaginationController extends PaginationController<'community', Amity.SearchCommunityLiveCollection> {
    getRequest(queryParams: Amity.SearchCommunityLiveCollection, token: string | undefined): Promise<Amity.CommunityPayload & Amity.Pagination>;
}
