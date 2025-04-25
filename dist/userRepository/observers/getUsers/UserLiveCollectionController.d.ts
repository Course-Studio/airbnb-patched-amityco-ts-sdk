import { UserPaginationController } from './UserPaginationController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
export declare class UserLiveCollectionController extends LiveCollectionController<'user', Amity.UserLiveCollection, Amity.User, UserPaginationController> {
    private queryStreamController;
    private query;
    constructor(query: Amity.UserLiveCollection, callback: Amity.LiveCollectionCallback<Amity.User>);
    protected setup(): void;
    protected persistModel(queryPayload: Amity.UserPayload & Amity.Pagination): Promise<void>;
    protected persistQueryStream({ response, direction, refresh, }: Amity.LiveCollectionPersistQueryStreamParams<'user'>): void;
    startSubscription(): Amity.Unsubscriber[];
    notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams): void;
    applyFilter(data: Amity.InternalUser[]): Amity.InternalUser[];
}
//# sourceMappingURL=UserLiveCollectionController.d.ts.map