import { SearchChannelMemberPaginationController } from './SearchChannelMemberPaginationController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
export declare class SearchChannelMemberLiveCollectionController extends LiveCollectionController<'channelUser', Amity.SearchChannelMembersLiveCollection, Amity.Membership<'channel'>, SearchChannelMemberPaginationController> {
    private queryStreamController;
    private query;
    constructor(query: Amity.SearchChannelMembersLiveCollection, callback: Amity.LiveCollectionCallback<Amity.Membership<'channel'>>);
    protected setup(): void;
    protected persistModel(queryPayload: Amity.ChannelMembershipPayload & Amity.Pagination): Promise<void>;
    protected persistQueryStream({ response, direction, refresh, }: Amity.LiveCollectionPersistQueryStreamParams<'channelUser'>): void;
    startSubscription(): Amity.Unsubscriber[];
    notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams): void;
    applyFilter(data: Amity.Membership<'channel'>[]): Amity.Membership<"channel">[];
}
//# sourceMappingURL=SearchChannelMemberLiveCollectionController.d.ts.map