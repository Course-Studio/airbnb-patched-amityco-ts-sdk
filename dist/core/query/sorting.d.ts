type SortingFunc<T = Record<string, unknown>> = (a: T, b: T) => number;
/**
 * Alphabetic sorting of objects having a displayName
 */
export declare const sortByDisplayName: SortingFunc<{
    displayName?: string;
}>;
/**
 * Alphabetic sorting of objects having a name
 */
export declare const sortByName: SortingFunc<{
    name?: string;
}>;
/**
 * Sorting a collection by their apparition order (oldest first)
 */
export declare const sortByChannelSegment: SortingFunc<{
    channelSegment: number;
}>;
/**
 * Sorting a collection by their apparition order (oldest first)
 */
export declare const sortBySegmentNumber: SortingFunc<{
    segmentNumber: number;
}>;
/**
 * Sorting a collection by its oldest items
 */
export declare const sortByFirstCreated: SortingFunc<{
    createdAt: Date | number | string;
}>;
/**
 * Sorting a story-collection by its localSortingDate
 */
export declare const sortByLocalSortingDate: SortingFunc<{
    localSortingDate: Date | number | string;
}>;
/**
 * Sorting a collection by its newest items
 */
export declare const sortByLastCreated: SortingFunc<{
    createdAt: Date | number | string;
}>;
/**
 * Sorting a collection by its oldest items
 * -- Due to Amity.UpdatedAt is an optional type, we need to define a default value to 0 to prevent error
 */
export declare const sortByFirstUpdated: SortingFunc<{
    updatedAt?: Date | number | string;
}>;
/**
 * Sorting a collection by its newest items
 * -- Due to Amity.UpdatedAt is an optional type, we need to define a default value to 0 to prevent error
 */
export declare const sortByLastUpdated: SortingFunc<{
    updatedAt?: Date | number | string;
}>;
/**
 * Sorting a collection by the items with most recent activity
 */
export declare const sortByLastActivity: SortingFunc<{
    lastActivity: Date | number | string;
}>;
export {};
