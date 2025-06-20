import { PaginationController } from '~/core/liveCollection/PaginationController';
/**
 * TODO: handle cache receive cache option, and cache policy
 * TODO: check if querybyIds is supported
 */
export declare class ChannelMemberPaginationController extends PaginationController<'channelUser', Amity.ChannelMembersLiveCollection> {
    getRequest(queryParams: Amity.ChannelMembersLiveCollection, token: string | undefined): Promise<{
        channels: Amity.RawChannel[];
        channelUsers: Amity.RawMembership<"channel">[];
        messagePreviews: Amity.MessagePreviewPayload[];
        users: Amity.RawUser[];
    } & Omit<Amity.UserPayload, "users"> & Amity.Pagination>;
}
