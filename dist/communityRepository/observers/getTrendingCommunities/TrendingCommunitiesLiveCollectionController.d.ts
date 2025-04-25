import { TrendingCommunitiesPaginationController } from './TrendingCommunitiesPaginationController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
export declare class TrendingCommunityLiveCollectionController extends LiveCollectionController<'community', Amity.TrendingCommunityLiveCollection, Amity.Community, TrendingCommunitiesPaginationController> {
    private queryStreamController;
    private query;
    constructor(query: Amity.TrendingCommunityLiveCollection, callback: Amity.LiveCollectionCallback<Amity.Community>);
    protected setup(): void;
    protected persistModel(queryPayload: Amity.TrendingCommunityPayload & Amity.Pagination): Promise<void>;
    protected persistQueryStream({ response, direction, refresh, }: Amity.LiveCollectionPersistQueryStreamParams<'community'>): void;
    startSubscription(): Amity.Unsubscriber[];
    notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams): void;
}
