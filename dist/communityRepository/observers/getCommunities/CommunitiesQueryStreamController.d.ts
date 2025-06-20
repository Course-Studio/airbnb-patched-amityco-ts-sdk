import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { EnumCommunityActions } from './enums';
import { EnumCommunityMemberActions } from '~/communityRepository/communityMembership/observers/getMembers/enums';
export declare class CommunitiesQueryStreamController extends QueryStreamController<Amity.CommunityPayload, Amity.CommunityLiveCollection> {
    private notifyChange;
    private preparePayload;
    constructor(query: Amity.CommunityLiveCollection, cacheKey: string[], notifyChange: (params: Amity.LiveCollectionNotifyParams) => void, preparePayload: (response: Amity.CommunityPayload) => Amity.ProcessedCommunityPayload);
    saveToMainDB(response: Amity.CommunityPayload): Promise<void>;
    appendToQueryStream(response: Amity.CommunityPayload & Partial<Amity.Pagination>, direction: Amity.LiveCollectionPageDirection, refresh?: boolean): void;
    reactor(action: EnumCommunityActions | EnumCommunityMemberActions): (community: Amity.Community) => void;
    subscribeRTE(createSubscriber: {
        fn: (reactor: (channel: Amity.Community) => void) => Amity.Unsubscriber;
        action: EnumCommunityActions | EnumCommunityMemberActions;
    }[]): Amity.Unsubscriber[];
}
