import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { EnumPostActions } from '../enums';
export declare class SemanticSearchPostQueryStreamController extends QueryStreamController<Amity.SemanticSearchPostPayload, Amity.SemanticSearchPostLiveCollection> {
    private notifyChange;
    private preparePayload;
    constructor(query: Amity.SemanticSearchPostLiveCollection, cacheKey: string[], notifyChange: (params: Amity.LiveCollectionNotifyParams) => void, preparePayload: (response: Amity.SemanticSearchPostPayload) => Amity.ProcessedSemanticSearchPostPayload);
    saveToMainDB(response: Amity.SemanticSearchPostPayload): Promise<void>;
    appendToQueryStream(response: Amity.SemanticSearchPostPayload & Partial<Amity.Pagination>, direction: Amity.LiveCollectionPageDirection, refresh?: boolean): void;
    reactor(action: EnumPostActions): (post: Amity.InternalPost) => void;
    subscribeRTE(createSubscriber: {
        fn: (reactor: (post: Amity.InternalPost) => void) => Amity.Unsubscriber;
        action: EnumPostActions;
    }[]): Amity.Unsubscriber[];
}
