import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { EnumCommunityActions } from './enums';
import { EnumCommunityMemberActions } from '~/communityRepository/communityMembership/observers/getMembers/enums';
export declare class SemanticSearchCommunityQueryStreamController extends QueryStreamController<Amity.SemanticSearchCommunityPayload, Amity.SemanticSearchCommunityLiveCollection> {
    private notifyChange;
    private preparePayload;
    constructor(query: Amity.SemanticSearchCommunityLiveCollection, cacheKey: string[], notifyChange: (params: Amity.LiveCollectionNotifyParams) => void, preparePayload: (response: Amity.SemanticSearchCommunityPayload) => Amity.ProcessedSemanticSearchCommunityPayload);
    saveToMainDB(response: Amity.SemanticSearchCommunityPayload): Promise<void>;
    appendToQueryStream(response: Amity.SemanticSearchCommunityPayload & Partial<Amity.Pagination>, direction: Amity.LiveCollectionPageDirection, refresh?: boolean): void;
    reactor(action: EnumCommunityActions | EnumCommunityMemberActions): (community: Amity.Community) => void;
    subscribeRTE(createSubscriber: {
        fn: (reactor: (community: Amity.Community) => void) => Amity.Unsubscriber;
        action: EnumCommunityActions | EnumCommunityMemberActions;
    }[]): Amity.Unsubscriber[];
}
//# sourceMappingURL=SemanticSearchCommunityQueryStreamController.d.ts.map