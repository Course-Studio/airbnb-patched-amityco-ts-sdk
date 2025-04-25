import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { StoryPaginationNoPageController } from './StoryPaginationNoPageController';
export declare class StoryQueryStreamController extends QueryStreamController<Amity.StoryPayload, Amity.StoryLiveCollection> {
    private notifyChange;
    private paginationController;
    constructor(query: Amity.StoryLiveCollection, cacheKey: string[], notifyChange: (params: Amity.LiveCollectionNotifyParams) => void, paginationController: StoryPaginationNoPageController);
    saveToMainDB(response: Amity.StoryPayload): void;
    getStoryReferenceIds(story: Amity.RawStory): string;
    appendToQueryStream(response: Amity.StoryPayload, direction: Amity.LiveCollectionPageDirection, refresh?: boolean): void;
    reactor(action: Amity.StoryActionType): (payload: Amity.InternalStory[]) => void;
    subscribeRTE(createSubscriber: {
        fn: (reactor: Amity.Listener<Amity.InternalStory[]>) => Amity.Unsubscriber;
        action: Amity.StoryActionType;
    }[]): Amity.Unsubscriber[];
}
