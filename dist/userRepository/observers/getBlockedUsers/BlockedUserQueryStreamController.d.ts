import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { EnumUserActions } from '../enums';
import { EnumFollowActions } from '~/userRepository/relationship/follow/enums';
export declare class BlockedUserQueryStreamController extends QueryStreamController<Amity.BlockedUserPayload, Amity.BlockedUsersLiveCollection> {
    private notifyChange;
    private preparePayload;
    constructor(query: Amity.BlockedUsersLiveCollection, cacheKey: string[], notifyChange: (params: Amity.LiveCollectionNotifyParams) => void, preparePayload: (response: Amity.BlockedUserPayload) => Amity.ProcessedBlockedUserPayload);
    saveToMainDB(response: Amity.BlockedUserPayload): Promise<void>;
    appendToQueryStream(response: Amity.BlockedUserPayload & Partial<Amity.Pagination>, direction: Amity.LiveCollectionPageDirection, refresh?: boolean): void;
    reactor(action: EnumUserActions | EnumFollowActions): (targetUser: Amity.InternalUser) => void;
    subscribeRTE(createSubscriber: {
        fn: (reactor: (user: Amity.InternalUser) => void) => Amity.Unsubscriber;
        action: EnumUserActions | EnumFollowActions;
    }[]): Amity.Unsubscriber[];
}
