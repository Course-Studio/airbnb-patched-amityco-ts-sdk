import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
export declare class ReactionQueryStreamController extends QueryStreamController<Amity.ReactionPayload, Amity.ReactionLiveCollection> {
    private notifyChange;
    private preparePayload;
    constructor(query: Amity.ReactionLiveCollection, cacheKey: string[], notifyChange: (params: Amity.LiveCollectionNotifyParams) => void, preparePayload: (response: Amity.ReactionPayload) => Amity.ReactionPayload);
    saveToMainDB(response: Amity.ReactionPayload): Promise<void>;
    appendToQueryStream(response: Amity.ReactionPayload & Partial<Amity.Pagination>, direction: Amity.LiveCollectionPageDirection, refresh?: boolean): void;
    reactor(action: Amity.ReactionActionTypeEnum): (reaction: Amity.InternalReactor) => void;
    subscribeRTE(createSubscriber: {
        fn: (reactor: (reaction: Amity.InternalReactor) => void) => Amity.Unsubscriber;
        action: Amity.ReactionActionTypeEnum;
    }[]): Amity.Unsubscriber[];
}
