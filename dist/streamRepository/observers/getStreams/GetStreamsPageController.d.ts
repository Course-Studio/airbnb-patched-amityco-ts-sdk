import { PaginationController } from '~/core/liveCollection/PaginationController';
export declare class GetStreamsPageController extends PaginationController<'stream', Amity.StreamLiveCollection> {
    getRequest(queryParams: Amity.StreamLiveCollection, token: string | undefined): Promise<{
        paging: {
            previous?: string | undefined;
            next?: string | undefined;
        };
        videoStreamings: Amity.RawStream[];
        videoStreamModerations: Amity.StreamModeration[];
        users: Amity.InternalUser[];
        files: Amity.File<"image">[];
    }>;
}
//# sourceMappingURL=GetStreamsPageController.d.ts.map