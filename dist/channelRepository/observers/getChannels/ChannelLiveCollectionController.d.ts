import { ChannelPaginationController } from './ChannelPaginationController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
import { ChannelPaginationNoPageController } from './ChannelPagnationNoPageController';
export declare class ChannelLiveCollectionController extends LiveCollectionController<'channel', Amity.ChannelLiveCollection, Amity.Channel, ChannelPaginationController | ChannelPaginationNoPageController> {
    private queryStreamController;
    private query;
    constructor(query: Amity.ChannelLiveCollection, callback: Amity.LiveCollectionCallback<Amity.Channel>);
    protected setup(): void;
    protected persistModel(response: Amity.ChannelPayload & Amity.Pagination): Promise<void>;
    protected persistQueryStream({ response, direction, refresh, }: Amity.LiveCollectionPersistQueryStreamParams<'channel'>): void;
    startSubscription(): Amity.Unsubscriber[];
    notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams): void;
    private applyFilter;
    private shouldAbort;
    private static getMessagePreviewSetting;
    private static getPaginationController;
    private getSubscriptions;
}
//# sourceMappingURL=ChannelLiveCollectionController.d.ts.map