import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
import { MessagePaginationController } from './MessagePaginationController';
export declare class MessageLiveCollectionController extends LiveCollectionController<'message', Amity.MessagesLiveCollection, Amity.Message, MessagePaginationController> {
    private queryStreamController;
    private query;
    constructor(query: Amity.MessagesLiveCollection, callback: Amity.LiveCollectionCallback<Amity.Message>);
    startSubscription(): Amity.Unsubscriber[];
    notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams): void;
    applyFilter(data: Amity.Message[]): Amity.Message<any>[];
    protected setup(): void;
    protected persistModel(response: Amity.MessagePayload & Amity.Pagination): Promise<void>;
    protected persistQueryStream({ response, direction, refresh, }: Amity.LiveCollectionPersistQueryStreamParams<'message'>): void;
}
