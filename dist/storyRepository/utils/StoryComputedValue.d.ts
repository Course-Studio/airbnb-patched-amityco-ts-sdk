export declare class StoryComputedValue {
    private readonly _targetId;
    private readonly _lastStoryExpiresAt?;
    private readonly _lastStorySeenExpiresAt?;
    private cacheStoryExpireTime?;
    private cacheStoreSeenTime?;
    private _syncingStoriesCount;
    private _errorStoriesCount;
    constructor(targetId: string, lastStoryExpiresAt?: Amity.timestamp, lastStorySeenExpiresAt?: Amity.timestamp);
    get lastStoryExpiresAt(): number;
    get lastStorySeenExpiresAt(): number;
    get localLastStoryExpires(): number;
    get localLastStorySeenExpiresAt(): number;
    get isContainUnSyncedStory(): boolean;
    getLocalLastSortingDate(): number;
    getHasUnseenFlag(): boolean;
    getTotalStoryByStatus(): void;
    get syncingStoriesCount(): number;
    get failedStoriesCount(): number;
}
//# sourceMappingURL=StoryComputedValue.d.ts.map