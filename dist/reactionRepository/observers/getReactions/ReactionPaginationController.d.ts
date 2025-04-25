import { PaginationController } from '~/core/liveCollection/PaginationController';
export declare class ReactionPaginationController extends PaginationController<'reaction', Amity.ReactionLiveCollection> {
    getRequest(queryParams: Amity.ReactionLiveCollection, token: string | undefined): Promise<Amity.ReactionPayload & Amity.Pagination>;
}
