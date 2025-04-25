import { BlockedUserPaginationController } from './BlockedUserPaginationController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
export declare class BlockedUserLiveCollectionController extends LiveCollectionController<'blockUser', Amity.BlockedUsersLiveCollection, Amity.User, BlockedUserPaginationController> {
    private queryStreamController;
    private query;
    constructor(query: Amity.BlockedUsersLiveCollection, callback: Amity.LiveCollectionCallback<Amity.User>);
    protected setup(): void;
    protected persistModel(queryPayload: Amity.BlockedUserPayload & Amity.Pagination): Promise<void>;
    protected persistQueryStream({ response, direction, refresh, }: Amity.LiveCollectionPersistQueryStreamParams<'blockUser'>): void;
    startSubscription(): Amity.Unsubscriber[];
    notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams): void;
    applyFilter(data: Amity.InternalUser[]): Amity.InternalUser[];
}
