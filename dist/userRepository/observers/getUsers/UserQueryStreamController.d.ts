import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { EnumUserActions } from '~/userRepository/observers/enums';
export declare class UserQueryStreamController extends QueryStreamController<Amity.UserPayload, Amity.UserLiveCollection> {
    private notifyChange;
    private preparePayload;
    constructor(query: Amity.UserLiveCollection, cacheKey: string[], notifyChange: (params: Amity.LiveCollectionNotifyParams) => void, preparePayload: (response: Amity.UserPayload) => Amity.ProcessedUserPayload);
    saveToMainDB(response: Amity.UserPayload): Promise<void>;
    appendToQueryStream(response: Amity.UserPayload & Partial<Amity.Pagination>, direction: Amity.LiveCollectionPageDirection, refresh?: boolean): void;
    reactor(action: EnumUserActions): (user: Amity.InternalUser) => void;
    subscribeRTE(createSubscriber: {
        fn: (reactor: (user: Amity.InternalUser) => void) => Amity.Unsubscriber;
        action: EnumUserActions;
    }[]): Amity.Unsubscriber[];
}
