import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { GlobalStoryPageController } from './GlobalStoryPageController';
export declare class GlobalStoryQueryStreamController extends QueryStreamController<Amity.GlobalStoryFeedPayload, Amity.LiveCollectionParams<Amity.StoryGlobalQuery>> {
    private notifyChange;
    private preparePayload;
    private paginationController;
    constructor(query: Amity.LiveCollectionParams<Amity.StoryGlobalQuery>, cacheKey: string[], notifyChange: (params: Amity.LiveCollectionNotifyParams) => void, paginationController: GlobalStoryPageController, preparePayload: (response: Amity.GlobalStoryFeedPayload) => Amity.ProcessedGlobalStoryFeed);
    saveToMainDB(response: Amity.GlobalStoryFeedPayload): void;
    appendToQueryStream(response: Amity.GlobalStoryFeedPayload, direction: Amity.LiveCollectionPageDirection, refresh?: boolean): void;
    reactor(actionType: Amity.StoryActionType): (payload: Amity.InternalStory[]) => void;
    subscribeRTE(createSubscriber: {
        fn: (reactor: Amity.Listener<Amity.InternalStory[]>) => Amity.Unsubscriber;
        action: Amity.StoryActionType;
    }[]): Amity.Unsubscriber[];
}
