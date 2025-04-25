declare class AnalyticsEngine {
    private _client;
    private _eventCapturer;
    private _eventSyncer;
    constructor();
    markPostAsViewed(postId: Amity.InternalPost['postId']): void;
    markStoryAsViewed(story: Amity.InternalStory): void;
    markAdAsViewed(ad: Amity.InternalAd, placement: Amity.AdPlacement): void;
    markAdAsClicked(ad: Amity.InternalAd, placement: Amity.AdPlacement): void;
    markStoryAsClicked(story: Amity.InternalStory): void;
    established(): void;
    handleTokenExpired(): void;
    destroy(): void;
    _stopAndDestroy(): void;
}
declare const _default: {
    getInstance: () => AnalyticsEngine;
};
export default _default;
//# sourceMappingURL=AnalyticsEngine.d.ts.map