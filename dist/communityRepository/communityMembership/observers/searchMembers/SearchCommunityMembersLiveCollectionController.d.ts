import { SearchCommunityMembersPaginationController } from './SearchCommunityMembersPaginationController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
export declare class SearchCommunityMembersLiveCollectionController extends LiveCollectionController<'communityUser', Amity.SearchCommunityMemberLiveCollection, Amity.Membership<'community'>, SearchCommunityMembersPaginationController> {
    private queryStreamController;
    private query;
    constructor(query: Amity.SearchCommunityMemberLiveCollection, callback: Amity.LiveCollectionCallback<Amity.Membership<'community'>>);
    protected setup(): void;
    protected persistModel(queryPayload: Amity.CommunityMembershipPayload & Amity.Pagination): Promise<void>;
    protected persistQueryStream({ response, direction, refresh, }: Amity.LiveCollectionPersistQueryStreamParams<'communityUser'>): void;
    startSubscription(): Amity.Unsubscriber[];
    notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams): void;
    applyFilter(data: Amity.Membership<'community'>[]): Amity.Membership<"community">[];
}
//# sourceMappingURL=SearchCommunityMembersLiveCollectionController.d.ts.map