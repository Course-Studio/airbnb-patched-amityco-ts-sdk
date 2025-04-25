import { PaginationController } from '~/core/liveCollection/PaginationController';
/**
 * TODO: handle cache receive cache option, and cache policy
 * TODO: check if querybyIds is supported
 */
export declare class CommunitiesPaginationController extends PaginationController<'community', Amity.CommunityLiveCollection> {
    getRequest(queryParams: Amity.CommunityLiveCollection, token: string | undefined): Promise<Amity.CommunityPayload & Amity.Pagination>;
}
