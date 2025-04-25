import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
import { GetStreamsPageController } from '~/streamRepository/observers/getStreams/GetStreamsPageController';
export declare class GetStreamsLiveCollectionController extends LiveCollectionController<'stream', Amity.StreamLiveCollection, Amity.Stream, GetStreamsPageController> {
    private queryStreamController;
    private query;
    constructor(query: Amity.StreamLiveCollection, callback: Amity.LiveCollectionCallback<Amity.Stream>);
    notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams): void;
    startSubscription(): Amity.Unsubscriber[];
    protected setup(): void;
    protected persistModel(response: Amity.StreamPayload): void;
    protected persistQueryStream({ response, direction, refresh, }: Amity.LiveCollectionPersistQueryStreamParams<'stream'>): void;
    private applyFilter;
}
//# sourceMappingURL=GetStreamsLiveCollectionController.d.ts.map