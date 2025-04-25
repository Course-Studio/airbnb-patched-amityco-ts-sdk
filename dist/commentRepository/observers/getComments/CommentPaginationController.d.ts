import { PaginationController } from '~/core/liveCollection/PaginationController';
export declare class CommentPaginationController extends PaginationController<'comment', Amity.CommentLiveCollection> {
    getRequest(queryParams: Amity.CommentLiveCollection, token: string | undefined): Promise<Amity.CommentPayload<any> & Amity.Pagination>;
}
