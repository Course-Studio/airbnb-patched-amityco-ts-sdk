import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
import { SubChannelPaginationController } from './SubChannelPaginationController';
export declare class SubChannelLiveCollectionController extends LiveCollectionController<'subChannel', Amity.SubChannelLiveCollection, Amity.SubChannel, SubChannelPaginationController> {
    private queryStreamController;
    private query;
    constructor(query: Amity.SubChannelLiveCollection, callback: Amity.LiveCollectionCallback<Amity.SubChannel>);
    protected setup(): void;
    protected persistModel(response: Amity.SubChannelPayload & Amity.Pagination): Promise<void>;
    protected persistQueryStream({ response, direction, refresh, }: Amity.LiveCollectionPersistQueryStreamParams<'subChannel'>): void;
    startSubscription(): Amity.Unsubscriber[];
    notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams): void;
    applyFilter(data: Amity.SubChannel[]): Amity.SubChannel[];
    isRelatedCollection(subChannelId: string): boolean;
}
