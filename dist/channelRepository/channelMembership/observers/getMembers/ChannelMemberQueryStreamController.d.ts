import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
export declare class ChannelMemberQueryStreamController extends QueryStreamController<Amity.ChannelMembershipPayload, Amity.ChannelMembersLiveCollection> {
    private notifyChange;
    private preparePayload;
    constructor(query: Amity.ChannelMembersLiveCollection, cacheKey: string[], notifyChange: (params: Amity.LiveCollectionNotifyParams) => void, preparePayload: (response: Amity.ChannelMembershipPayload) => Promise<Amity.ProcessedChannelPayload>);
    saveToMainDB(response: Amity.ChannelMembershipPayload): Promise<void>;
    appendToQueryStream(response: Amity.ChannelPayload & Partial<Amity.Pagination>, direction: Amity.LiveCollectionPageDirection, refresh?: boolean): void;
    reactor(action: string): (channel: Amity.StaticInternalChannel, channelMember: Amity.Membership<"channel">) => void;
    subscribeRTE(createSubscriber: {
        fn: (reactor: (channel: Amity.StaticInternalChannel, channelMember: Amity.Membership<'channel'>) => void) => Amity.Unsubscriber;
        action: string;
    }[]): Amity.Unsubscriber[];
}
