import { SearchUserPaginationController } from './SearchUserPaginationController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
export declare class SearchUserLiveCollectionController extends LiveCollectionController<'user', Amity.SearchUserLiveCollection, Amity.User, SearchUserPaginationController> {
    private queryStreamController;
    private query;
    constructor(query: Amity.SearchUserLiveCollection, callback: Amity.LiveCollectionCallback<Amity.User>);
    protected setup(): void;
    protected persistModel(queryPayload: Amity.UserPayload & Amity.Pagination): Promise<void>;
    protected persistQueryStream({ response, direction, refresh, }: Amity.LiveCollectionPersistQueryStreamParams<'user'>): void;
    startSubscription(): Amity.Unsubscriber[];
    notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams): void;
    applyFilter(data: Amity.InternalUser[]): Amity.InternalUser[];
}
