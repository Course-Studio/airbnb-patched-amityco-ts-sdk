import { SemanticSearchPostPaginationController } from './SemanticSearchPostPaginationController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
export declare class SemanticSearchPostLiveCollectionController extends LiveCollectionController<'semanticSearchPost', Amity.SemanticSearchPostLiveCollection, Amity.Post, SemanticSearchPostPaginationController> {
    private queryStreamController;
    private query;
    constructor(inputQuery: Amity.SemanticSearchPostLiveCollection, callback: Amity.LiveCollectionCallback<Amity.Post>);
    protected setup(): void;
    protected persistModel(queryPayload: Amity.SemanticSearchPostPayload & Amity.Pagination): Promise<void>;
    protected persistQueryStream({ response, direction, refresh, }: Amity.LiveCollectionPersistQueryStreamParams<'semanticSearchPost'>): void;
    startSubscription(): Amity.Unsubscriber[];
    notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams): void;
    applyFilter(data: Amity.InternalPost[]): Amity.InternalPost<any>[];
}
