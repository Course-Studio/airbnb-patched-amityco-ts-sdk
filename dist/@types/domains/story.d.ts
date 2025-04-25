import { VideoResolution } from './file';
declare global {
    namespace Amity {
        type CommunityStorySettings = {
            storySetting?: {
                enableComment?: boolean;
            };
        };
        type StoryTargetType = 'community' | 'user' | 'content';
        type StorySortBy = 'createdAt' | 'updatedAt';
        const enum StoryItemType {
            Hyperlink = "hyperlink"
        }
        const enum StoryActionType {
            OnCreate = "onCreate",
            OnUpdate = "onUpdate",
            OnDelete = "onDelete",
            OnError = "onError",
            OnReactionAdded = "onReactionAdded",
            OnReactionRemoved = "onReactionRemoved"
        }
        const enum StoryDataType {
            Text = "text",
            Image = "image",
            Video = "video"
        }
        const enum StorySeenQuery {
            SEEN = "seen",
            UNSEEN = "unseen",
            ALL = "all",
            SMART = "smart"
        }
        type StorySortOption = {
            sortBy?: StorySortBy;
            orderBy?: 'asc' | 'desc';
        };
        type StoryGlobalQuery = {
            seenState: Amity.StorySeenQuery;
        };
        type RawStoryTarget = {
            targetId: string;
            targetType: string;
            targetPublicId: string;
            targetUpdatedAt: Amity.timestamp;
            lastStoryExpiresAt?: Amity.timestamp;
            lastStorySeenExpiresAt?: Amity.timestamp;
            localFilter?: Amity.StorySeenQuery;
        };
        type StoryTargetQueryParam = Pick<Amity.RawStoryTarget, 'targetId' | 'targetType'>;
        type StoryTargetLiveObjectParam = {
            query: Amity.StoryTargetQueryParam;
        };
        type GetStoriesByTargetParam = {
            options?: Amity.StorySortOption;
        } & Amity.StoryTargetQueryParam;
        type StoryLiveCollection = {
            targets: Amity.StoryTargetQueryParam[];
            options?: Amity.StorySortOption;
        };
        type StoryTarget = Pick<Amity.RawStoryTarget, 'targetId' | 'targetType'> & {
            updatedAt: Amity.timestamp;
            hasUnseen: boolean;
            lastStoryExpiresAt?: Amity.timestamp;
            localLastExpires: number;
            localLastSeen: number;
            localSortingDate: number;
            localFilter?: Amity.StorySeenQuery;
            syncingStoriesCount: number;
            failedStoriesCount: number;
        };
        type StoryItemData<T extends StoryItemType> = T extends 'hyperlink' ? {
            url: string;
            customText: string;
        } : never;
        type StoryItem = {
            type: StoryItemType;
            data: StoryItemData<StoryItemType>;
            placement?: {
                width: number;
                height: number;
                transform: {
                    translate_x: number;
                    translate_y: number;
                    scale_x: number;
                    scale_y: number;
                    rotate: number;
                };
            };
        };
        type StoryOptimistic = {
            syncState?: Amity.SyncState;
        };
        type StoryLinkedObject = {
            videoData?: Amity.File<'video'>;
            imageData?: Amity.File<'image'>;
            analytics: {
                markAsSeen: () => void;
                markLinkAsClicked: () => void;
            };
            creator?: Amity.User;
            storyTarget?: Amity.StoryTarget;
            community?: Amity.Community;
            communityCategories?: Amity.Category[];
            isSeen?: boolean;
        };
        type RawStory = {
            storyId: string;
            path: string;
            creatorId: Amity.InternalUser['userId'];
            creatorPublicId: string;
            targetId: string;
            targetPublicId: string;
            targetType: StoryTargetType;
            dataType: StoryDataType;
            items: StoryItem[];
            data: {
                text?: string;
                fileId?: Amity.File['fileId'];
                fileData?: ArrayBuffer | string | null;
                thumbnailFileId?: Amity.File['fileId'];
                imageDisplayMode?: Amity.ImageDisplayMode;
                videoFileId?: {
                    [VideoResolution.ORIGINAL]?: string;
                };
            };
            comments: Amity.Comment['commentId'][];
            commentsCount: Amity.InternalPost['commentsCount'];
            isDeleted: boolean;
            hasFlaggedComment: boolean;
            mentionedUsers: Amity.Post['mentionees'];
            impression: 0;
            reach: 0;
            referenceId?: string;
        } & Amity.Metadata & Amity.Flaggable & Amity.CreatedAt & Amity.UpdatedAt & Amity.ExpiresAt & Amity.Reactable;
        type InternalStory = Amity.RawStory & Amity.StoryOptimistic;
        type StoryCreatePayload = {
            data: {
                text?: string;
                fileId?: Amity.File['fileId'];
                fileData?: ArrayBuffer | string | null;
                imageDisplayMode?: Amity.ImageDisplayMode;
                videoFileId?: Amity.RawStory['data']['videoFileId'];
            };
            referenceId: string;
            dataType: Amity.StoryDataType;
            items: Amity.StoryItem[];
            targetType: Amity.StoryTargetType;
            targetId: string;
            metadata: Amity.Metadata;
            syncState: Amity.SyncState;
        };
        type StoryLiveCollectionCache = Amity.LiveCollectionCache<Amity.InternalStory['referenceId'], {
            page?: Amity.Token;
        }>;
        type StoryTargetLiveCollectionCache = Amity.LiveCollectionCache<Amity.RawStoryTarget['targetId'], {
            page?: Amity.Token;
        }>;
        type Story = Amity.InternalStory & Amity.StoryLinkedObject;
    }
}
