export declare function syncUsage({ bufferCurrentUsage, getActiveStreams, updateUsage, dispose, }: {
    bufferCurrentUsage: () => Amity.UsageDataModel[];
    getActiveStreams: () => string[];
    updateUsage: (data: Amity.UsageDataModel) => void;
    dispose: () => void;
}): Promise<boolean>;
