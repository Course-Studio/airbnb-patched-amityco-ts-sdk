import { PostPaginationController } from './PostPaginationController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
export declare class PostLiveCollectionController extends LiveCollectionController<'post', Amity.PostLiveCollection, Amity.Post, PostPaginationController> {
    private queryStreamController;
    private query;
    constructor(query: Amity.PostLiveCollection, callback: Amity.LiveCollectionCallback<Amity.Post>);
    protected setup(): void;
    protected persistModel(queryPayload: Amity.PostPayload & Amity.Pagination): Promise<void>;
    protected persistQueryStream({ response, direction, refresh, }: Amity.LiveCollectionPersistQueryStreamParams<'post'>): void;
    startSubscription(): Amity.Unsubscriber[];
    notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams): void;
    applyFilter(data: Amity.InternalPost[]): Amity.InternalPost<any>[];
}
