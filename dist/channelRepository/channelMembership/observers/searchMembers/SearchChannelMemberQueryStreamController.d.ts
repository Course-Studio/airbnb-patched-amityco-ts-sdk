import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
export declare class SearchChannelMemberQueryStreamController extends QueryStreamController<Amity.ChannelMembershipPayload, Amity.SearchChannelMembersLiveCollection> {
    private notifyChange;
    private preparePayload;
    constructor(query: Amity.SearchChannelMembersLiveCollection, cacheKey: string[], notifyChange: (params: Amity.LiveCollectionNotifyParams) => void, preparePayload: (response: Amity.ChannelMembershipPayload) => Promise<Amity.ProcessedChannelPayload>);
    saveToMainDB(response: Amity.ChannelMembershipPayload): Promise<void>;
    appendToQueryStream(response: Amity.ChannelPayload & Partial<Amity.Pagination>, direction: Amity.LiveCollectionPageDirection, refresh?: boolean): void;
    reactor(action: string): (channel: Amity.InternalChannel, channelMember: Amity.Membership<"channel">) => void;
    subscribeRTE(createSubscriber: {
        fn: (reactor: (channel: Amity.InternalChannel, channelMember: Amity.Membership<'channel'>) => void) => Amity.Unsubscriber;
        action: string;
    }[]): Amity.Unsubscriber[];
}
