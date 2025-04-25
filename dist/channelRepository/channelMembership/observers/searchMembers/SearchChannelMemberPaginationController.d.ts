import { PaginationController } from '~/core/liveCollection/PaginationController';
/**
 * TODO: handle cache receive cache option, and cache policy
 * TODO: check if querybyIds is supported
 */
export declare class SearchChannelMemberPaginationController extends PaginationController<'channelUser', Amity.ChannelMembersLiveCollection> {
    getRequest(queryParams: Amity.ChannelMembersLiveCollection, token: string | undefined): Promise<{
        channels: Amity.RawChannel<any>[];
        channelUsers: Amity.RawMembership<"channel">[];
        messagePreviews: Amity.MessagePreviewPayload<any>[];
        users: Amity.RawUser[];
    } & Omit<Amity.UserPayload, "users"> & Amity.Pagination>;
}
