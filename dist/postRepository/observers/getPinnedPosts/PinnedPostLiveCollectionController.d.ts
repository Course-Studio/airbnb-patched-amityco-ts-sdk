import { PinnedPostPaginationController } from './PinnedPostPaginationController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
export declare class PinnedPostLiveCollectionController extends LiveCollectionController<'pinnedPost', Amity.PinnedPostLiveCollection, Amity.PinnedPost, PinnedPostPaginationController> {
    private queryStreamController;
    private query;
    constructor(query: Amity.PinnedPostLiveCollection, callback: Amity.LiveCollectionCallback<Amity.PinnedPost>);
    protected setup(): void;
    protected persistModel(queryPayload: Amity.PinnedPostPayload & Amity.Pagination): Promise<void>;
    protected persistQueryStream({ response, direction, refresh, }: Amity.LiveCollectionPersistQueryStreamParams<'pinnedPost'>): void;
    startSubscription(): Amity.Unsubscriber[];
    notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams): void;
    private applyFilter;
}
