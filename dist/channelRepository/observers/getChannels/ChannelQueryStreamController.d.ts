import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { ChannelPaginationController } from './ChannelPaginationController';
import { ChannelPaginationNoPageController } from './ChannelPagnationNoPageController';
export declare class ChannelQueryStreamController extends QueryStreamController<Amity.ChannelPayload, Amity.ChannelLiveCollection> {
    private notifyChange;
    private preparePayload;
    private paginationController;
    constructor(query: Amity.ChannelLiveCollection, cacheKey: string[], notifyChange: (params: Amity.LiveCollectionNotifyParams) => void, preparePayload: (response: Amity.ChannelPayload) => Promise<Amity.ProcessedChannelPayload>, paginationController: ChannelPaginationController | ChannelPaginationNoPageController);
    saveToMainDB(response: Amity.ChannelPayload): Promise<void>;
    appendToQueryStream(response: Amity.ChannelPayload & Partial<Amity.Pagination>, direction: Amity.LiveCollectionPageDirection, refresh?: boolean): void;
    reactor(action: Amity.ChannelActionType): (payload: Amity.StaticInternalChannel | Amity.StaticInternalChannel[]) => void;
    subscribeRTE(createSubscriber: {
        fn: (reactor: Amity.Listener<Amity.StaticInternalChannel | Amity.StaticInternalChannel[]>) => Amity.Unsubscriber;
        action: Amity.ChannelActionType;
    }[]): Amity.Unsubscriber[];
}
