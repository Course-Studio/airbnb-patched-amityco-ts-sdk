export declare const queryCategories: {
    (query?: Amity.QueryCategories): Promise<Amity.Cached<Amity.PageToken<Amity.InternalCategory>>>;
    locally(query: Parameters<typeof queryCategories>[0]): Amity.Cached<Amity.PageToken<Amity.InternalCategory>> | undefined;
};
