import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { GetStreamsPageController } from '~/streamRepository/observers/getStreams/GetStreamsPageController';
export declare class GetStreamsQueryStreamController extends QueryStreamController<Amity.StreamPayload, Amity.StreamLiveCollection> {
    private notifyChange;
    private paginationController;
    constructor(query: Amity.StreamLiveCollection, cacheKey: string[], notifyChange: (params: Amity.LiveCollectionNotifyParams) => void, paginationController: GetStreamsPageController);
    saveToMainDB(response: Amity.StreamPayload): void;
    appendToQueryStream(response: Amity.StreamPayload & Partial<Amity.Pagination>, direction: Amity.LiveCollectionPageDirection, refresh?: boolean): void;
    reactor(action: string): (payload: Amity.InternalStream) => void;
    subscribeRTE(createSubscriber: {
        fn: (reactor: Amity.Listener<Amity.InternalStream>) => Amity.Unsubscriber;
        action: string;
    }[]): Amity.Unsubscriber[];
}
//# sourceMappingURL=GetStreamsQueryStreamController.d.ts.map