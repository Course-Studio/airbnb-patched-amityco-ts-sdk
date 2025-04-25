import { PaginationController } from '~/core/liveCollection/PaginationController';
export declare class GlobalPinnedPostPaginationController extends PaginationController<'pinnedPost', Amity.GlobalPinnedPostLiveCollection> {
    getRequest(queryParams: Amity.GlobalPinnedPostLiveCollection, token: string | undefined): Promise<{
        pinTargets: Amity.RawPinTarget[];
        pins: Amity.RawPin[];
        posts: Amity.RawPost<any>[];
        postChildren: Amity.RawPost<any>[];
        comments: Amity.RawComment<any>[];
        videoStreamings: Amity.RawStream[];
        polls: Amity.RawPoll[];
    } & Amity.CommunityPayload & Amity.Pagination>;
}
//# sourceMappingURL=GlobalPinnedPostPaginationController.d.ts.map