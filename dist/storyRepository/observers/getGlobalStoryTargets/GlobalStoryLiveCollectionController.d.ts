import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
import { GlobalStoryPageController } from './GlobalStoryPageController';
export declare class GlobalStoryLiveCollectionController extends LiveCollectionController<'globalStoryFeed', Amity.StoryGlobalQuery, Amity.StoryTarget, GlobalStoryPageController> {
    private queryStreamController;
    private query;
    constructor(query: Amity.StoryGlobalQuery, callback: Amity.LiveCollectionCallback<Amity.StoryTarget>);
    protected setup(): void;
    protected persistModel(response: Amity.GlobalStoryFeedPayload): void;
    protected persistQueryStream({ response, direction, refresh, }: Amity.LiveCollectionPersistQueryStreamParams<'globalStoryFeed'>): void;
    notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams): void;
    private applyFilter;
    startSubscription(): Amity.Unsubscriber[];
}
