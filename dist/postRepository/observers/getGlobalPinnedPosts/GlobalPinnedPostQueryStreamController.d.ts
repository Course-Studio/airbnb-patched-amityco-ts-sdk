import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { EnumPostActions } from '../enums';
export declare class GlobalPinnedPostQueryStreamController extends QueryStreamController<Amity.PinnedPostPayload, Amity.GlobalPinnedPostLiveCollection> {
    private notifyChange;
    private preparePayload;
    constructor(query: Amity.GlobalPinnedPostLiveCollection, cacheKey: string[], notifyChange: (params: Amity.LiveCollectionNotifyParams) => void, preparePayload: (response: Amity.PinnedPostPayload) => Amity.ProcessedPostPayload);
    saveToMainDB(response: Amity.PinnedPostPayload): Promise<void>;
    appendToQueryStream(response: Amity.PinnedPostPayload & Partial<Amity.Pagination>, direction: Amity.LiveCollectionPageDirection, refresh?: boolean): void;
    reactor(action: EnumPostActions): (post: Amity.InternalPost) => void;
    subscribeRTE(createSubscriber: {
        fn: (reactor: (post: Amity.InternalPost) => void) => Amity.Unsubscriber;
        action: EnumPostActions;
    }[]): Amity.Unsubscriber[];
}
//# sourceMappingURL=GlobalPinnedPostQueryStreamController.d.ts.map