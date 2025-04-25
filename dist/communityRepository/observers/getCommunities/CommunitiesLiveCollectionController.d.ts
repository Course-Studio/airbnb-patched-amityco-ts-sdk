import { CommunitiesPaginationController } from './CommunitiesPaginationController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
export declare class CommunityLiveCollectionController extends LiveCollectionController<'community', Amity.CommunityLiveCollection, Amity.Community, CommunitiesPaginationController> {
    private queryStreamController;
    private query;
    constructor(query: Amity.CommunityLiveCollection, callback: Amity.LiveCollectionCallback<Amity.Community>);
    protected setup(): void;
    protected persistModel(queryPayload: Amity.CommunityPayload & Amity.Pagination): Promise<void>;
    protected persistQueryStream({ response, direction, refresh, }: Amity.LiveCollectionPersistQueryStreamParams<'community'>): void;
    startSubscription(): Amity.Unsubscriber[];
    notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams): void;
    applyFilter(data: Amity.Community[]): Amity.Community[];
}
