import { FollowerPaginationController } from './FollowerPaginationController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
export declare class FollowerLiveCollectionController extends LiveCollectionController<'follower', Amity.FollowerLiveCollection, Amity.FollowStatus, FollowerPaginationController> {
    private queryStreamController;
    private query;
    constructor(query: Amity.FollowerLiveCollection, callback: Amity.LiveCollectionCallback<Amity.FollowStatus>);
    protected setup(): void;
    protected persistModel(queryPayload: Amity.FollowersPayload & Amity.Pagination): Promise<void>;
    protected persistQueryStream({ response, direction, refresh, }: Amity.LiveCollectionPersistQueryStreamParams<'follower'>): void;
    startSubscription(): Amity.Unsubscriber[];
    notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams): void;
    applyFilter(data: Amity.InternalFollowStatus[]): Amity.RawFollowStatus[];
}
//# sourceMappingURL=FollowerLiveCollectionController.d.ts.map