declare class ObjectResolverEngine {
    private readonly TIMER_INTERVAL_MS;
    private readonly BUFFER_ID_LIMIT;
    private buffer;
    private timer;
    private isResolvingTask;
    private connectionListener;
    private isConnected;
    constructor();
    startResolver(): void;
    stopResolver(): void;
    resolve(id: string, referenceType: Amity.ReferenceType): void;
    private addConnectionListener;
    private removeConnectionListener;
    private resolveObjects;
    private clearBuffer;
    private getBuffer;
    onSessionEstablished(): void;
    onSessionDestroyed(): void;
    onTokenExpired(): void;
}
declare const _default: {
    getInstance: () => ObjectResolverEngine;
};
export default _default;
//# sourceMappingURL=objectResolverEngine.d.ts.map