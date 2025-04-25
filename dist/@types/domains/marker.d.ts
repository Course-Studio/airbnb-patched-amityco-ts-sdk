export {};
declare global {
    namespace Amity {
        const enum MarkerSyncEvent {
            START_SYNCING = "start syncing",
            HAS_MORE = "has_more",
            NEW_MESSAGE = "new message",
            RESUME = "resume",
            CHANNEL_CREATED = "subchannel is created",
            CHANNEL_DELETED = "subchannel is deleted",
            CHANNEL_JOINED = "subchannel is joined",
            CHANNEL_LEFT = "subchannel is left",
            SUB_CHANNEL_CREATED = "subchannel is created",
            SUBCHANNEL_IS_DELETED = "subchannel is deleted",
            FORCE_SYNC = "force sync",
            MARKER_UPDATED = "feed marker updated"
        }
        type ChannelUnreadInfo = {
            channelId: Amity.RawChannel['channelId'];
            unreadCount: number;
            isMentioned: boolean;
        } & Amity.Timestamps;
        type SubChannelUnreadInfo = {
            subChannelId: Amity.RawSubChannel['messageFeedId'];
            channelId: Amity.RawChannel['channelId'];
            readToSegment: number;
            lastSegment: number;
            lastMentionSegment: number;
            unreadCount: number;
            isMentioned: boolean;
            isDeleted: boolean;
        } & Amity.Timestamps;
    }
}
