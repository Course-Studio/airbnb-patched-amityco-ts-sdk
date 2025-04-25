import { ReactionPaginationController } from './ReactionPaginationController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
export declare class ReactionLiveCollectionController extends LiveCollectionController<'reaction', Amity.ReactionLiveCollection, Amity.Reactor, ReactionPaginationController> {
    private queryStreamController;
    private query;
    constructor(query: Amity.ReactionLiveCollection, callback: Amity.LiveCollectionCallback<Amity.Reactor>);
    protected setup(): void;
    protected persistModel(queryPayload: Amity.ReactionPayload & Amity.Pagination): Promise<void>;
    protected persistQueryStream({ response, direction, refresh, }: Amity.LiveCollectionPersistQueryStreamParams<'reaction'>): void;
    startSubscription(): Amity.Unsubscriber[];
    notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams): void;
}
