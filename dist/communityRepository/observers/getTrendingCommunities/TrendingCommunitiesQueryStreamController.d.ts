import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { EnumCommunityActions } from './enums';
import { EnumCommunityMemberActions } from '~/communityRepository/communityMembership/observers/getMembers/enums';
export declare class TrendingCommunitiesQueryStreamController extends QueryStreamController<Amity.TrendingCommunityPayload, Amity.TrendingCommunityLiveCollection> {
    private notifyChange;
    private preparePayload;
    constructor(query: Amity.TrendingCommunityLiveCollection, cacheKey: string[], notifyChange: (params: Amity.LiveCollectionNotifyParams) => void, preparePayload: (response: Amity.TrendingCommunityPayload) => Amity.ProcessedCommunityPayload);
    saveToMainDB(response: Amity.TrendingCommunityPayload): Promise<void>;
    appendToQueryStream(response: Amity.TrendingCommunityPayload & Partial<Amity.Pagination>, direction: Amity.LiveCollectionPageDirection, refresh?: boolean): void;
    reactor(action: EnumCommunityActions | EnumCommunityMemberActions): (community: Amity.Community) => void;
    subscribeRTE(createSubscriber: {
        fn: (reactor: (channel: Amity.Community) => void) => Amity.Unsubscriber;
        action: EnumCommunityActions | EnumCommunityMemberActions;
    }[]): Amity.Unsubscriber[];
}
