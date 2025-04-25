import { CommentPaginationController } from './CommentPaginationController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
export declare class CommentLiveCollectionController extends LiveCollectionController<'comment', Amity.CommentLiveCollection, Amity.Comment, CommentPaginationController> {
    private queryStreamController;
    private query;
    constructor(query: Amity.CommentLiveCollection, callback: Amity.LiveCollectionCallback<Amity.Comment>);
    protected setup(): void;
    protected persistModel(queryPayload: Amity.CommentPayload & Amity.Pagination): Promise<void>;
    protected persistQueryStream({ response, direction, refresh, }: Amity.LiveCollectionPersistQueryStreamParams<'comment'>): void;
    startSubscription(): Amity.Unsubscriber[];
    notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams): void;
    applyFilter(data: Amity.InternalComment[]): Amity.InternalComment<any>[];
}
//# sourceMappingURL=CommentLiveCollectionController.d.ts.map