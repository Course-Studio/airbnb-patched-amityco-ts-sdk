export declare class AnalyticsEventSyncer {
    _timer: NodeJS.Timeout | undefined;
    _high_priority_timer: NodeJS.Timeout | undefined;
    start(): void;
    stop(): void;
    syncCapturedEvent(): Promise<void>;
    syncHighPriorityCapturedEvent(): Promise<void>;
}
