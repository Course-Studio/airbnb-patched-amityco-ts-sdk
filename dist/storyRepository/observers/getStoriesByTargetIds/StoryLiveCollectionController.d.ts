import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
import { StoryPaginationNoPageController } from './StoryPaginationNoPageController';
export declare class StoryLiveCollectionController extends LiveCollectionController<'story', Amity.StoryLiveCollection, Amity.Story, StoryPaginationNoPageController> {
    private queryStreamController;
    private query;
    constructor(query: Amity.StoryLiveCollection, callback: Amity.LiveCollectionCallback<Amity.Story>);
    protected setup(): void;
    protected persistModel(response: Amity.StoryPayload): void;
    protected persistQueryStream({ response, direction, refresh, }: Amity.LiveCollectionPersistQueryStreamParams<'story'>): void;
    notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams): void;
    private applyFilter;
    startSubscription(): Amity.Unsubscriber[];
}
//# sourceMappingURL=StoryLiveCollectionController.d.ts.map