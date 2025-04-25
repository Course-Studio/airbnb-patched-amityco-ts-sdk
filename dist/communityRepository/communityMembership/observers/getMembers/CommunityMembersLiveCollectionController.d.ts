import { CommunityMembersPaginationController } from './CommunityMembersPaginationController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
export declare class CommunityMembersLiveCollectionController extends LiveCollectionController<'communityUser', Amity.CommunityMemberLiveCollection, Amity.Membership<'community'>, CommunityMembersPaginationController> {
    private queryStreamController;
    private query;
    constructor(query: Amity.CommunityMemberLiveCollection, callback: Amity.LiveCollectionCallback<Amity.Membership<'community'>>);
    protected setup(): void;
    protected persistModel(queryPayload: Amity.CommunityMembershipPayload & Amity.Pagination): Promise<void>;
    protected persistQueryStream({ response, direction, refresh, }: Amity.LiveCollectionPersistQueryStreamParams<'communityUser'>): void;
    startSubscription(): Amity.Unsubscriber[];
    notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams): void;
    applyFilter(data: Amity.Membership<'community'>[]): Amity.Membership<"community">[];
}
//# sourceMappingURL=CommunityMembersLiveCollectionController.d.ts.map