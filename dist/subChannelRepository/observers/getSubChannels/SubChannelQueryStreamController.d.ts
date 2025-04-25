import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
export declare class SubChannelQueryStreamController extends QueryStreamController<Amity.SubChannelPayload, Amity.SubChannelLiveCollection> {
    private notifyChange;
    private preparePayload;
    constructor(query: Amity.SubChannelLiveCollection, cacheKey: string[], notifyChange: (params: Amity.LiveCollectionNotifyParams) => void, preparePayload: (response: Amity.SubChannelPayload) => Promise<Amity.ProcessedSubChannelPayload>);
    saveToMainDB(response: Amity.SubChannelPayload): Promise<void>;
    appendToQueryStream(response: Amity.SubChannelPayload & Partial<Amity.Pagination>, direction: Amity.LiveCollectionPageDirection, refresh?: boolean): void;
    reactor(action: string): (payload: Amity.SubChannel | Amity.SubChannel[]) => void;
    subscribeRTE(createSubscriber: {
        fn: (reactor: Amity.Listener<Amity.SubChannel | Amity.SubChannel[]>) => Amity.Unsubscriber;
        action: string;
    }[]): Amity.Unsubscriber[];
}
//# sourceMappingURL=SubChannelQueryStreamController.d.ts.map