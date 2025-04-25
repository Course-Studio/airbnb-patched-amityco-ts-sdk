export {};
declare global {
    namespace Amity {
        const enum ReadReceiptSyncState {
            CREATED = "create",
            SYNCING = "syncing"
        }
        type ReadReceipt = {
            channelId: Amity.Channel['channelId'];
            latestSegment: number;
            latestSyncSegment: number;
        };
        type ReadReceiptSyncJob = {
            channelId: Amity.Channel['channelId'];
            segment: number;
            syncState: ReadReceiptSyncState;
            retryCount: number;
        };
        type LegacyReadReceipt = {
            subChannelId: Amity.SubChannel['subChannelId'];
            latestSegment: number;
            latestSyncSegment: number;
        };
        type LegacyReadReceiptSyncJob = {
            subChannelId: Amity.SubChannel['subChannelId'];
            segment: number;
            syncState: ReadReceiptSyncState;
            retryCount: number;
        };
    }
}
