import { PaginationNoPageController } from '~/core/liveCollection/PaginationNoPageController';
export declare class ChannelPaginationNoPageController extends PaginationNoPageController<'channel', Pick<Amity.ChannelLiveCollection, 'channelIds'>> {
    getRequest(queryParams: Pick<Amity.ChannelLiveCollection, 'channelIds'>): Promise<Amity.ChannelPayload<any>>;
}
//# sourceMappingURL=ChannelPagnationNoPageController.d.ts.map