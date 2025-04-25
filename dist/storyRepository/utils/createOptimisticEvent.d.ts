export declare const createOptimisticEvent: ({ payload, formData, isVideo, }: {
    payload: Amity.StoryCreatePayload;
    formData?: FormData;
    isVideo?: boolean;
}, callback: (optimisticData: Amity.StoryPayload) => void) => void;
