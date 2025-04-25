import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { EnumCommunityMemberActions } from './enums';
export declare class SearchCommunityMembersQueryStreamController extends QueryStreamController<Amity.CommunityMembershipPayload, Amity.SearchCommunityMemberLiveCollection> {
    private notifyChange;
    private preparePayload;
    constructor(query: Amity.SearchCommunityMemberLiveCollection, cacheKey: string[], notifyChange: (params: Amity.LiveCollectionNotifyParams) => void, preparePayload: (response: Amity.CommunityMembershipPayload) => Amity.ProcessedCommunityMembershipPayload);
    saveToMainDB(response: Amity.CommunityMembershipPayload): Promise<void>;
    appendToQueryStream(response: Amity.CommunityMembershipPayload & Partial<Amity.Pagination>, direction: Amity.LiveCollectionPageDirection, refresh?: boolean): void;
    reactor(action: EnumCommunityMemberActions): (community: Amity.Community, communityMembers: Amity.Membership<"community">[]) => void;
    subscribeRTE(createSubscriber: {
        fn: (reactor: (channel: Amity.Community, communityUser: Amity.Membership<'community'>[]) => void) => Amity.Unsubscriber;
        action: EnumCommunityMemberActions;
    }[]): Amity.Unsubscriber[];
}
