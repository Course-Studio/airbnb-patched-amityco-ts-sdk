import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
export declare class NotificationTrayItemsQuerystreamController extends QueryStreamController<Amity.NotificationTrayPayload, Amity.NotificationTrayItemLiveCollection> {
    private notifyChange;
    private preparePayload;
    constructor(query: Amity.NotificationTrayItemLiveCollection, cacheKey: string[], notifyChange: (params: Amity.LiveCollectionNotifyParams) => void, preparePayload: (response: Amity.NotificationTrayPayload) => Amity.ProcessedNotificationTrayPayload);
    saveToMainDB(response: Amity.NotificationTrayPayload): Promise<void>;
    appendToQueryStream(response: Amity.NotificationTrayPayload & Partial<Amity.Pagination>, direction: Amity.LiveCollectionPageDirection, refresh?: boolean): void;
}
//# sourceMappingURL=NotificationTrayItemsQuerystreamController.d.ts.map