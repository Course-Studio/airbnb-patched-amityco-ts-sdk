export {};
declare global {
    namespace Amity {
        type InternalCategory = {
            categoryId: string;
            name: string;
            avatarFileId?: Amity.File<'image'>['fileId'];
        } & Amity.Metadata & Amity.Timestamps & Amity.SoftDelete;
        type Category = InternalCategory & {
            avatar?: Amity.File<'image'> | null;
        };
        type QueryCategories = {
            includeDeleted?: boolean;
            sortBy?: 'name' | 'firstCreated' | 'lastCreated';
            page?: string;
            limit?: number;
        };
        type CategoryLiveCollection = Amity.LiveCollectionParams<Omit<QueryCategories, 'page'>>;
        type CategoryLiveCollectionCache = Amity.LiveCollectionCache<Amity.InternalCategory['categoryId'], Pick<QueryCategories, 'page'>>;
    }
}
