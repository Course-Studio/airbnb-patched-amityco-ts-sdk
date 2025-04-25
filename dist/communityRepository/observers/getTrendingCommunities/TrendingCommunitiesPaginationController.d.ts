import { PaginationController } from '~/core/liveCollection/PaginationController';
/**
 * TODO: handle cache receive cache option, and cache policy
 * TODO: check if querybyIds is supported
 */
export declare class TrendingCommunitiesPaginationController extends PaginationController<'community', Amity.TrendingCommunityLiveCollection> {
    getRequest(queryParams: Amity.TrendingCommunityLiveCollection, token: string | undefined): Promise<Amity.CommunityPayload & Amity.Pagination>;
}
