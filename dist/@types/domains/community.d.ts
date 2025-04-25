import { AmityCommunityMemberStatusFilter } from '~/communityRepository/constants';
export declare const CommunityPostSettings: Readonly<{
    ONLY_ADMIN_CAN_POST: "ONLY_ADMIN_CAN_POST";
    ADMIN_REVIEW_POST_REQUIRED: "ADMIN_REVIEW_POST_REQUIRED";
    ANYONE_CAN_POST: "ANYONE_CAN_POST";
}>;
export declare const CommunityPostSettingMaps: Readonly<{
    ONLY_ADMIN_CAN_POST: {
        needApprovalOnPostCreation: boolean;
        onlyAdminCanPost: boolean;
    };
    ADMIN_REVIEW_POST_REQUIRED: {
        needApprovalOnPostCreation: boolean;
        onlyAdminCanPost: boolean;
    };
    ANYONE_CAN_POST: {
        needApprovalOnPostCreation: boolean;
        onlyAdminCanPost: boolean;
    };
}>;
export declare const DefaultCommunityPostSetting = "ONLY_ADMIN_CAN_POST";
declare global {
    namespace Amity {
        const enum CommunitySortByEnum {
            FirstCreated = "firstCreated",
            LastCreated = "lastCreated"
        }
        type CommunitySortBy = `${Amity.CommunitySortByEnum}`;
        const enum SearchCommunitySortByEnum {
            FirstCreated = "firstCreated",
            LastCreated = "lastCreated",
            DisplayName = "displayName"
        }
        type SearchCommunitySortBy = `${Amity.SearchCommunitySortByEnum}`;
        const enum CommunityMemberSortByEnum {
            FirstCreated = "firstCreated",
            LastCreated = "lastCreated"
        }
        type CommunityMemberSortBy = `${Amity.CommunityMemberSortByEnum}`;
        const enum SearchCommunityMemberSortByEnum {
            FirstCreated = "firstCreated",
            LastCreated = "lastCreated",
            DisplayName = "displayName"
        }
        type SearchCommunityMemberSortBy = `${Amity.SearchCommunityMemberSortByEnum}`;
        type CommunityActionType = 'onCreate' | 'onUpdate' | 'onDelete' | 'onJoin' | 'onLeft' | 'onMemberCountChanged';
        type CommunityMemberActionType = 'onJoin' | 'onLeft' | 'onBan' | 'onUnban' | 'onMemberCountChanged';
        type RawCommunity = {
            communityId: string;
            displayName: string;
            avatarFileId?: File<'image'>['fileId'];
            description?: string;
            channelId: Amity.Channel['channelId'];
            userId: Amity.InternalUser['userId'];
            isOfficial?: boolean;
            isPublic?: boolean;
            isJoined?: boolean;
            onlyAdminCanPost?: boolean;
            needApprovalOnPostCreation?: boolean;
            postsCount: number;
            membersCount: number;
            categoryIds: Amity.InternalCategory['categoryId'][];
            hasFlaggedComment: boolean;
            hasFlaggedPost: boolean;
            allowCommentInStory?: boolean;
        } & Amity.Taggable & Amity.Metadata & Amity.Timestamps & Amity.SoftDelete & Amity.Subscribable;
        type Community = Omit<Amity.RawCommunity, 'onlyAdminCanPost' | 'needApprovalOnPostCreation'> & Amity.CommunityStorySettings & {
            postSetting?: ValueOf<typeof CommunityPostSettings>;
        };
        type QueryCommunities = {
            membership?: 'all' | 'member' | 'notMember';
            categoryId?: Amity.InternalCategory['categoryId'];
            includeDeleted?: boolean;
            tags?: Amity.Taggable['tags'];
            sortBy?: Amity.CommunitySortBy | Amity.CommunitySortByEnum;
            page?: string;
            limit?: number;
        };
        type SearchQueryCommunities = {
            displayName?: string;
            membership?: 'all' | 'member' | 'notMember';
            categoryId?: Amity.InternalCategory['categoryId'];
            includeDeleted?: boolean;
            tags?: Amity.Taggable['tags'];
            sortBy?: Amity.SearchCommunitySortBy | Amity.SearchCommunitySortByEnum;
            page?: string;
            limit?: number;
        };
        type CommunityLiveCollection = Amity.LiveCollectionParams<Omit<QueryCommunities, 'page'>>;
        type RecommendedCommunityLiveCollection = Amity.LiveCollectionParams<{
            limit?: number;
        }>;
        type TrendingCommunityLiveCollection = Amity.LiveCollectionParams<{
            limit?: number;
        }>;
        type SearchCommunityLiveCollection = Amity.LiveCollectionParams<Omit<SearchQueryCommunities, 'page'>>;
        type CommunityLiveCollectionCache = Amity.LiveCollectionCache<Amity.Community['communityId'], Pick<QueryCommunities, 'page'>>;
        type RecommendedCommunityLiveCollectionCache = Amity.CommunityLiveCollectionCache;
        type TrendingCommunityLiveCollectionCache = Amity.CommunityLiveCollectionCache;
        type SearchCommunityLiveCollectionCache = Amity.LiveCollectionCache<Amity.Community['communityId'], Pick<SearchQueryCommunities, 'page'>>;
        type QueryCommunityMembers = {
            communityId: string;
            memberships?: ('banned' | 'member')[];
            roles?: string[];
            sortBy?: Amity.CommunityMemberSortByEnum | Amity.CommunityMemberSortBy;
            page?: string;
            limit?: number;
            includeDeleted?: boolean;
        };
        type QuerySearchCommunityMembers = {
            communityId: string;
            memberships?: ('banned' | 'member')[];
            roles?: string[];
            sortBy?: Amity.SearchCommunityMemberSortByEnum | Amity.SearchCommunityMemberSortBy;
            search?: Amity.InternalUser['displayName'] | Amity.InternalUser['userId'];
            page?: string;
            limit?: number;
            includeDeleted?: boolean;
        };
        type CommunityMemberLiveCollection = Amity.LiveCollectionParams<Omit<QueryCommunityMembers, 'page'>>;
        type SearchCommunityMemberLiveCollection = Amity.LiveCollectionParams<Omit<QuerySearchCommunityMembers, 'page'>>;
        type CommunityMemberLiveCollectionCache = Amity.LiveCollectionCache<Amity.Membership<'community'>['userId'], Pick<QueryCommunityMembers, 'page'>>;
        type SearchCommunityMemberLiveCollectionCache = Amity.LiveCollectionCache<Amity.Community['communityId'], Pick<QuerySearchCommunityMembers, 'page'>>;
        type QuerySemanticSearchCommunity = {
            query: string;
            categoryIds?: string[];
            filter?: AmityCommunityMemberStatusFilter;
            options?: {
                limit?: number;
                token?: string;
            };
            tags?: string[];
        };
        type SemanticSearchCommunityLiveCollection = Amity.LiveCollectionParams<Omit<QuerySemanticSearchCommunity, 'page' | 'filter' | 'options'>> & {
            communityMembershipStatus?: AmityCommunityMemberStatusFilter;
        };
        type SemanticSearchCommunityLiveCollectionCache = Amity.LiveCollectionCache<Amity.Community['communityId'], // communityId:score
        QuerySemanticSearchCommunity>;
    }
}
