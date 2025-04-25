import { getUsageCollector } from '../api/getUsageCollector';
export declare class EventRegister {
    player: HTMLVideoElement;
    _startTime: null | number;
    _usageCollector: ReturnType<typeof getUsageCollector>;
    resolution: null | string;
    _controller: AbortController;
    _sessionId: null | string;
    _observer: MutationObserver;
    constructor(player: HTMLVideoElement, resolution: string);
    _resetStartTime(): void;
    _shouldUpdateCollector(): boolean;
    _sendUsageToCollector(): void;
    registerEvents(): void;
    _unregisterEvents(): void;
}
