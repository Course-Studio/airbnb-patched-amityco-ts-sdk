export declare const getCategory: {
    (categoryId: Amity.InternalCategory["categoryId"]): Promise<Amity.Cached<Amity.InternalCategory>>;
    locally(categoryId: Amity.InternalCategory["categoryId"]): Amity.Cached<Amity.InternalCategory> | undefined;
};
