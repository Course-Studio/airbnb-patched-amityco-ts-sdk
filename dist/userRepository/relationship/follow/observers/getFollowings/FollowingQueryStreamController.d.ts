import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { EnumFollowActions } from '~/userRepository/relationship/follow/enums';
export declare class FollowingQueryStreamController extends QueryStreamController<Amity.FollowingsPayload, Amity.FollowingLiveCollection> {
    private notifyChange;
    private preparePayload;
    constructor(query: Amity.FollowingLiveCollection, cacheKey: string[], notifyChange: (params: Amity.LiveCollectionNotifyParams) => void, preparePayload: (response: Amity.FollowingsPayload) => Amity.ProcessedFollowingsPayload);
    saveToMainDB(response: Amity.FollowingsPayload): Promise<void>;
    appendToQueryStream(response: Amity.FollowingsPayload & Partial<Amity.Pagination>, direction: Amity.LiveCollectionPageDirection, refresh?: boolean): void;
    reactor(action: EnumFollowActions): (followStatus: Amity.InternalFollowStatus) => void;
    subscribeRTE(createSubscriber: {
        fn: (reactor: (user: Amity.InternalFollowStatus) => void) => Amity.Unsubscriber;
        action: EnumFollowActions;
    }[]): Amity.Unsubscriber[];
}
//# sourceMappingURL=FollowingQueryStreamController.d.ts.map