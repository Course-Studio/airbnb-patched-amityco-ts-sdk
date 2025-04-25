export declare class LegacyMessageReadReceiptSyncEngine {
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
    private getReadReceipt;
    private markReadApi;
    private removeSynedReceipt;
    private startObservingReadReceiptQueue;
    private stopObservingReadReceiptQueue;
    onSessionEstablished(): void;
    onSessionDestroyed(): void;
    onTokenExpired(): void;
    onNetworkOffline(): void;
    onNetworkOnline(): void;
    markRead(subChannelId: string, segment: number): void;
    private enqueueReadReceipt;
    private getSyncJob;
    private enqueueJob;
    private removeJobFromQueue;
}
declare const _default: {
    getInstance: () => LegacyMessageReadReceiptSyncEngine;
};
export default _default;
//# sourceMappingURL=legacyReadReceiptSyncEngine.d.ts.map