import { PaginationController } from '~/core/liveCollection/PaginationController';
/**
 * TODO: handle cache receive cache option, and cache policy
 * TODO: check if querybyIds is supported
 */
export declare class SubChannelPaginationController extends PaginationController<'subChannel', Amity.SubChannelLiveCollection> {
    getRequest(queryParams: Amity.SubChannelLiveCollection, token: string | undefined): Promise<Amity.SubChannelPayload<any> & Amity.Pagination>;
}
//# sourceMappingURL=SubChannelPaginationController.d.ts.map