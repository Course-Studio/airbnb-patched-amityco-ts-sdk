import { PaginationController } from '~/core/liveCollection/PaginationController';
export declare class PinnedPostPaginationController extends PaginationController<'pinnedPost', Amity.PinnedPostLiveCollection> {
    getRequest(queryParams: Amity.PinnedPostLiveCollection, token: string | undefined): Promise<{
        pinTargets: Amity.RawPinTarget[];
        pins: Amity.RawPin[];
        posts: Amity.RawPost<any>[];
        postChildren: Amity.RawPost<any>[];
        comments: Amity.RawComment<any>[];
        videoStreamings: Amity.RawStream[];
        polls: Amity.RawPoll[];
    } & Amity.CommunityPayload & Amity.Pagination>;
}
//# sourceMappingURL=PinnedPostPaginationController.d.ts.map