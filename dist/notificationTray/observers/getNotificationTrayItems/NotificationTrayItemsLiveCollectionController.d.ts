import { NotificationTrayItemsPaginationController } from './NotificationTrayItemsPaginationController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
export declare class NotificationTrayItemsLiveCollectionController extends LiveCollectionController<'notificationTrayItem', Amity.NotificationTrayItemLiveCollection, Amity.NotificationTrayItem, NotificationTrayItemsPaginationController> {
    private queryStreamController;
    private query;
    constructor(query: Amity.NotificationTrayItemLiveCollection, callback: Amity.LiveCollectionCallback<Amity.NotificationTrayItem>);
    protected setup(): void;
    protected persistModel(queryPayload: Amity.NotificationTrayPayload & Amity.Pagination): Promise<void>;
    protected persistQueryStream({ response, direction, refresh, }: Amity.LiveCollectionPersistQueryStreamParams<'notificationTrayItem'>): void;
    startSubscription(): Amity.Unsubscriber[];
    notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams): void;
}
