import { GlobalPinnedPostPaginationController } from './GlobalPinnedPostPaginationController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
export declare class GlobalPinnedPostLiveCollectionController extends LiveCollectionController<'pinnedPost', Amity.GlobalPinnedPostLiveCollection, Amity.PinnedPost, GlobalPinnedPostPaginationController> {
    private queryStreamController;
    private query;
    constructor(query: Amity.GlobalPinnedPostLiveCollection, callback: Amity.LiveCollectionCallback<Amity.PinnedPost>);
    protected setup(): void;
    protected persistModel(queryPayload: Amity.PinnedPostPayload & Amity.Pagination): Promise<void>;
    protected persistQueryStream({ response, direction, refresh, }: Amity.LiveCollectionPersistQueryStreamParams<'pinnedPost'>): void;
    startSubscription(): Amity.Unsubscriber[];
    notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams): void;
}
