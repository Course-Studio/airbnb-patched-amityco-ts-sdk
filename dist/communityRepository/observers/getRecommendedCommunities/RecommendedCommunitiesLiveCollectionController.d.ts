import { RecommendedCommunitiesPaginationController } from './RecommendedCommunitiesPaginationController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
export declare class RecommendedCommunityLiveCollectionController extends LiveCollectionController<'community', Amity.RecommendedCommunityLiveCollection, Amity.Community, RecommendedCommunitiesPaginationController> {
    private queryStreamController;
    private query;
    constructor(query: Amity.RecommendedCommunityLiveCollection, callback: Amity.LiveCollectionCallback<Amity.Community>);
    protected setup(): void;
    protected persistModel(queryPayload: Amity.CommunityPayload & Amity.Pagination): Promise<void>;
    protected persistQueryStream({ response, direction, refresh, }: Amity.LiveCollectionPersistQueryStreamParams<'community'>): void;
    startSubscription(): Amity.Unsubscriber[];
    notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams): void;
}
