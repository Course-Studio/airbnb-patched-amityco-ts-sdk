export declare class AnalyticsEventCapturer {
    _expireTime: number;
    _poolLimit: number;
    _recentViewed: {
        [key: Amity.InternalPost['postId']]: Date;
    };
    _recentHighPriorityViewed: {
        [key: Amity.InternalStory['storyId']]: Date;
    };
    _throttleStoryTimer: NodeJS.Timeout | undefined;
    _bufferNewSeenStoryReferenceIds: Amity.Story['referenceId'][];
    isAbleToEnqueue({ uniqueId, expireTime, isHighPriority, }: {
        uniqueId: string;
        expireTime: number;
        isHighPriority?: boolean;
    }): boolean;
    markAs({ uniqueId, contentId, contentType, activityType, metadata, }: {
        uniqueId: string;
        contentId: string;
        contentType: Amity.AnalyticEventContentType;
        activityType: Amity.AnalyticEventActivityType;
        metadata?: Record<string, string>;
    }): void;
    markPostAsViewed(postId: Amity.InternalPost['postId']): void;
    markStory(story: Amity.InternalStory, activityType: Amity.AnalyticEventActivityType): void;
    resetAllBuckets(): void;
    markStoryAsViewed(story: Amity.InternalStory): void;
    markStoryAsClicked(story: Amity.InternalStory): void;
    markAdAsViewed(ad: Amity.InternalAd, placement: Amity.AdPlacement): void;
    markAdAsClicked(ad: Amity.InternalAd, placement: Amity.AdPlacement): void;
}
