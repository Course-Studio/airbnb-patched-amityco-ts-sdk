import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { EnumPostActions } from '../enums';
export declare class PostQueryStreamController extends QueryStreamController<Amity.PostPayload, Amity.PostLiveCollection> {
    private notifyChange;
    private preparePayload;
    constructor(query: Amity.PostLiveCollection, cacheKey: string[], notifyChange: (params: Amity.LiveCollectionNotifyParams) => void, preparePayload: (response: Amity.PostPayload) => Amity.ProcessedPostPayload);
    saveToMainDB(response: Amity.PostPayload): Promise<void>;
    appendToQueryStream(response: Amity.PostPayload & Partial<Amity.Pagination>, direction: Amity.LiveCollectionPageDirection, refresh?: boolean): void;
    reactor(action: EnumPostActions): (post: Amity.InternalPost) => void;
    subscribeRTE(createSubscriber: {
        fn: (reactor: (post: Amity.InternalPost) => void) => Amity.Unsubscriber;
        action: EnumPostActions;
    }[]): Amity.Unsubscriber[];
}
