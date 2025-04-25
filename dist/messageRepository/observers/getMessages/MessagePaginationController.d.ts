import { PaginationController } from '~/core/liveCollection/PaginationController';
/**
 * TODO: handle cache receive cache option, and cache policy
 * TODO: check if querybyIds is supported
 */
export declare class MessagePaginationController extends PaginationController<'message', Amity.MessagesLiveCollection> {
    getRequest(queryParams: Amity.MessagesLiveCollection, token: string | undefined): Promise<Omit<Amity.ProcessedMessagePayload<any>, "messages" | "messageFeeds"> & {
        messages: Amity.RawMessage<any>[];
        messageFeeds?: Amity.RawSubChannel[];
    } & Amity.Pagination>;
}
