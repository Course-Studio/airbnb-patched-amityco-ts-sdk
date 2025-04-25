import { SemanticSearchCommunityPaginationController } from './SemanticSearchCommunityPaginationController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
export declare class SemanticSearchCommunityLiveCollectionController extends LiveCollectionController<'semanticSearchCommunity', Amity.SemanticSearchCommunityLiveCollection, Amity.Community, SemanticSearchCommunityPaginationController> {
    private queryStreamController;
    private query;
    constructor(query: Amity.SemanticSearchCommunityLiveCollection, callback: Amity.LiveCollectionCallback<Amity.Community>);
    protected setup(): void;
    protected persistModel(queryPayload: Amity.SemanticSearchCommunityPayload & Amity.Pagination): Promise<void>;
    protected persistQueryStream({ response, direction, refresh, }: Amity.LiveCollectionPersistQueryStreamParams<'semanticSearchCommunity'>): void;
    startSubscription(): Amity.Unsubscriber[];
    notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams): void;
    applyFilter(data: Amity.Community[]): Amity.Community[];
}
