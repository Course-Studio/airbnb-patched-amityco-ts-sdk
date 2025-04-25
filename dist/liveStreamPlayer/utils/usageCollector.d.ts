export declare const USAGE_SYNC_INTERVAL: number;
/**
 * @class
 *
 * Usage Collector is responsible for collecting data from live stream video
 * events and periodically passing the collected data down to Usage Syncer
 *
 */
export declare class UsageCollector {
    _unsyncedData: Amity.UsageDataModel[];
    _syncBuffer: Amity.UsageDataModel[];
    _activeStreams: string[];
    _syncInterval: null | ReturnType<typeof setInterval>;
    constructor();
    registerStream(streamId: string): void;
    getActiveStreams(): string[];
    unregisterStream(streamId: string): void;
    updateUsage(data: Amity.UsageDataModel): void;
    bufferCurrentUsage(): Amity.UsageDataModel[];
    dispose(): void;
    _startInterval(): void;
}
