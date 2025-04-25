export declare const getStoriesByTargetIds: (params: {
    targets: Amity.StoryTargetQueryParam[];
    options?: Amity.StorySortOption;
}, callback: Amity.LiveCollectionCallback<Amity.Story>, config?: Amity.LiveCollectionConfig) => () => void;
