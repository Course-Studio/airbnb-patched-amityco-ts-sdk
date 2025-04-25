import { ChannelMemberPaginationController } from './ChannelMemberPaginationController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
export declare class ChannelMemberLiveCollectionController extends LiveCollectionController<'channelUser', Amity.ChannelMembersLiveCollection, Amity.Membership<'channel'>, ChannelMemberPaginationController> {
    private queryStreamController;
    private query;
    constructor(query: Amity.ChannelMembersLiveCollection, callback: Amity.LiveCollectionCallback<Amity.Membership<'channel'>>);
    protected setup(): void;
    protected persistModel(queryPayload: Amity.ChannelMembershipPayload & Amity.Pagination): Promise<void>;
    protected persistQueryStream({ response, direction, refresh, }: Amity.LiveCollectionPersistQueryStreamParams<'channelUser'>): void;
    startSubscription(): Amity.Unsubscriber[];
    notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams): void;
    applyFilter(data: Amity.Membership<'channel'>[]): Amity.Membership<"channel">[];
}
//# sourceMappingURL=ChannelMemberLiveCollectionController.d.ts.map