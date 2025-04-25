import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { EnumFollowActions } from '~/userRepository/relationship/follow/enums';
export declare class FollowerQueryStreamController extends QueryStreamController<Amity.FollowersPayload, Amity.FollowerLiveCollection> {
    private notifyChange;
    private preparePayload;
    constructor(query: Amity.FollowerLiveCollection, cacheKey: string[], notifyChange: (params: Amity.LiveCollectionNotifyParams) => void, preparePayload: (response: Amity.FollowersPayload) => Amity.ProcessedFollowersPayload);
    saveToMainDB(response: Amity.FollowersPayload): Promise<void>;
    appendToQueryStream(response: Amity.FollowersPayload & Partial<Amity.Pagination>, direction: Amity.LiveCollectionPageDirection, refresh?: boolean): void;
    reactor(action: EnumFollowActions): (followStatus: Amity.InternalFollowStatus) => void;
    subscribeRTE(createSubscriber: {
        fn: (reactor: (followStatus: Amity.InternalFollowStatus) => void) => Amity.Unsubscriber;
        action: EnumFollowActions;
    }[]): Amity.Unsubscriber[];
}
