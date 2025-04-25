import { PaginationController } from '~/core/liveCollection/PaginationController';
/**
 * TODO: handle cache receive cache option, and cache policy
 * TODO: check if querybyIds is supported
 */
export declare class RecommendedCommunitiesPaginationController extends PaginationController<'community', Amity.RecommendedCommunityLiveCollection> {
    getRequest(queryParams: Amity.RecommendedCommunityLiveCollection, token: string | undefined): Promise<Amity.CommunityPayload & Amity.Pagination>;
}
//# sourceMappingURL=RecommendedCommunitiesPaginationController.d.ts.map