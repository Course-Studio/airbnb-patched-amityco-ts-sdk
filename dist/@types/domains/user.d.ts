import { AmityUserSearchMatchType } from '~/userRepository';
export {};
declare global {
    namespace Amity {
        const enum UserSortByEnum {
            FirstCreated = "firstCreated",
            LastCreated = "lastCreated"
        }
        type UserSearchMatchType = AmityUserSearchMatchType;
        type UserSortBy = `${Amity.UserSortByEnum}`;
        const enum SearchUserSortByEnum {
            FirstCreated = "firstCreated",
            LastCreated = "lastCreated",
            DisplayName = "displayName"
        }
        type SearchUserSortBy = `${Amity.SearchUserSortByEnum}`;
        type UserActionType = 'onFetch' | 'onUpdate' | 'onDelete' | 'onFlagged' | 'onUnflagged' | 'onFlagCleared';
        type RawUser = {
            _id: string;
            userId: string;
            userInternalId: string;
            userPublicId: string;
            displayName?: string;
            avatarFileId?: string;
            avatarCustomUrl?: string;
            description?: string;
            isBrand: boolean;
            isGlobalBan: boolean;
        } & Amity.Metadata & Amity.Taggable & Amity.Flaggable & Amity.Accredited & Amity.Timestamps & Amity.SoftDelete & Amity.Subscribable;
        type InternalUser = Amity.RawUser & {
            isGlobalBanned: boolean;
        } & Amity.Metadata & Amity.Taggable & Amity.Flaggable & Amity.Accredited & Amity.Timestamps & Amity.SoftDelete & Amity.Subscribable;
        type User = Amity.InternalUser & {
            avatar?: Amity.File<'image'> | null;
        };
        type QueryUsers = {
            filter?: 'all' | 'flagged';
            sortBy?: Amity.UserSortBy | Amity.UserSortByEnum;
            limit?: number;
            page?: string;
            matchType?: UserSearchMatchType;
        };
        type QuerySearchUsers = {
            displayName?: Amity.InternalUser['displayName'];
            filter?: 'all' | 'flagged';
            sortBy?: Amity.SearchUserSortBy | Amity.SearchUserSortByEnum;
            limit?: number;
            page?: string;
            matchType?: UserSearchMatchType;
        };
        type UserLiveCollection = Amity.LiveCollectionParams<Omit<Amity.QueryUsers, 'page'>>;
        type SearchUserLiveCollection = Amity.LiveCollectionParams<Omit<Amity.QuerySearchUsers, 'sortBy'>>;
        type UserSearchLiveCollection = Amity.SearchUserLiveCollection;
        type UserLiveCollectionCache = Amity.LiveCollectionCache<Amity.InternalUser['userId'], Pick<QueryUsers, 'page'>>;
    }
}
