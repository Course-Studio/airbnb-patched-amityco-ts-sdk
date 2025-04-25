declare class AnalyticsService {
    private analyticEngine;
    constructor();
    markPostAsViewed(postId: string): void;
}
declare const _default: {
    getInstance: () => AnalyticsService;
};
export default _default;
