export declare class MessageReadReceiptSyncEngine {
    private client;
    private isActive;
    private MAX_RETRY;
    private JOB_QUEUE_SIZE;
    private jobQueue;
    private timer;
    private RECEIPT_SYNC_INTERVAL;
    constructor();
    startSyncReadReceipt(): void;
    syncReadReceipts(): void;
    private getUnsyncJobs;
    private getReadReceipts;
    private markReadApi;
    private startObservingReadReceiptQueue;
    private stopObservingReadReceiptQueue;
    onSessionEstablished(): void;
    onSessionDestroyed(): void;
    onTokenExpired(): void;
    onNetworkOffline(): void;
    onNetworkOnline(): void;
    markRead(channelId: string, segment: number): void;
    private enqueueReadReceipt;
    private getSyncJob;
    private enqueueJob;
}
declare const _default: {
    getInstance: () => MessageReadReceiptSyncEngine;
};
export default _default;
//# sourceMappingURL=readReceiptSyncEngine.d.ts.map