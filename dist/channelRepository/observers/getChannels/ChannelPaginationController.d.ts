import { PaginationController } from '~/core/liveCollection/PaginationController';
/**
 * TODO: handle cache receive cache option, and cache policy
 * TODO: check if querybyIds is supported
 */
export declare class ChannelPaginationController extends PaginationController<'channel', Amity.ChannelLiveCollection> {
    getRequest(queryParams: Amity.ChannelLiveCollection, token: string | undefined): Promise<Amity.UserPayload & {
        channels: Amity.RawChannel<any>[];
        channelUsers: Amity.RawMembership<"channel">[];
        messagePreviews: Amity.MessagePreviewPayload<any>[];
        messageFeedsInfo?: Amity.messageFeedsInfoPayload[] | undefined;
    } & Amity.Pagination>;
}
//# sourceMappingURL=ChannelPaginationController.d.ts.map