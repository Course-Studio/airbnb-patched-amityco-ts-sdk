import { FollowingPaginationController } from './FollowingPaginationController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
export declare class FollowingLiveCollectionController extends LiveCollectionController<'following', Amity.FollowingLiveCollection, Amity.FollowStatus, FollowingPaginationController> {
    private queryStreamController;
    private query;
    constructor(query: Amity.FollowingLiveCollection, callback: Amity.LiveCollectionCallback<Amity.FollowStatus>);
    protected setup(): void;
    protected persistModel(queryPayload: Amity.FollowingsPayload & Amity.Pagination): Promise<void>;
    protected persistQueryStream({ response, direction, refresh, }: Amity.LiveCollectionPersistQueryStreamParams<'following'>): void;
    startSubscription(): Amity.Unsubscriber[];
    notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams): void;
    applyFilter(data: Amity.InternalFollowStatus[]): Amity.RawFollowStatus[];
}
