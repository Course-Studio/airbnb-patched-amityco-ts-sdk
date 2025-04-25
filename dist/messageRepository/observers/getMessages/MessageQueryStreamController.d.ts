import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { MessagePaginationController } from './MessagePaginationController';
export declare class MessageQueryStreamController extends QueryStreamController<Amity.MessagePayload, Amity.MessagesLiveCollection> {
    private notifyChange;
    private preparePayload;
    private paginationController;
    constructor(query: Amity.MessagesLiveCollection, cacheKey: string[], notifyChange: (params: Amity.LiveCollectionNotifyParams) => void, preparePayload: (response: Amity.MessagePayload) => Promise<Amity.ProcessedMessagePayload>, paginationController: MessagePaginationController);
    saveToMainDB(response: Amity.MessagePayload): Promise<void>;
    appendToQueryStream(response: Amity.MessagePayload & Partial<Amity.Pagination>, direction: Amity.LiveCollectionPageDirection, refresh?: boolean): void;
    reactor(action: string): (payload: Amity.InternalMessage) => void;
    subscribeRTE(createSubscriber: {
        fn: (reactor: Amity.Listener<Amity.InternalMessage>) => Amity.Unsubscriber;
        action: string;
    }[]): Amity.Unsubscriber[];
}
