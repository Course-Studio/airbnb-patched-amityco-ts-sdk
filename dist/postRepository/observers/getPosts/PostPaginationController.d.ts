import { PaginationController } from '~/core/liveCollection/PaginationController';
export declare class PostPaginationController extends PaginationController<'post', Amity.PostLiveCollection> {
    getRequest(queryParams: Amity.PostLiveCollection, token: string | undefined): Promise<Amity.PostPayload<any> & Amity.Pagination>;
}
