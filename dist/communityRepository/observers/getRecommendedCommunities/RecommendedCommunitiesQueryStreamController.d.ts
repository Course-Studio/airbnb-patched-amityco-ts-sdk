import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { EnumCommunityActions } from './enums';
import { EnumCommunityMemberActions } from '~/communityRepository/communityMembership/observers/getMembers/enums';
export declare class RecommendedCommunitiesQueryStreamController extends QueryStreamController<Amity.RecommendedCommunityPayload, Amity.RecommendedCommunityLiveCollection> {
    private notifyChange;
    private preparePayload;
    constructor(query: Amity.RecommendedCommunityLiveCollection, cacheKey: string[], notifyChange: (params: Amity.LiveCollectionNotifyParams) => void, preparePayload: (response: Amity.RecommendedCommunityPayload) => Amity.ProcessedCommunityPayload);
    saveToMainDB(response: Amity.RecommendedCommunityPayload): Promise<void>;
    appendToQueryStream(response: Amity.RecommendedCommunityPayload & Partial<Amity.Pagination>, direction: Amity.LiveCollectionPageDirection, refresh?: boolean): void;
    reactor(action: EnumCommunityActions | EnumCommunityMemberActions): (community: Amity.Community) => void;
    subscribeRTE(createSubscriber: {
        fn: (reactor: (channel: Amity.Community) => void) => Amity.Unsubscriber;
        action: EnumCommunityActions | EnumCommunityMemberActions;
    }[]): Amity.Unsubscriber[];
}
