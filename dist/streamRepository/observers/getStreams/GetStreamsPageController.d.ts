import { PaginationController } from '~/core/liveCollection/PaginationController';
export declare class GetStreamsPageController extends PaginationController<'stream', Amity.StreamLiveCollection> {
    getRequest(queryParams: Amity.StreamLiveCollection, token: string | undefined): Promise<{
        paging: {
            previous?: Amity.Token;
            next?: Amity.Token;
        };
        videoStreamings: Amity.InternalStream[];
        videoStreamModerations: Amity.StreamModeration[];
        users: Amity.InternalUser[];
        files: Amity.File<"image">[];
    }>;
}
