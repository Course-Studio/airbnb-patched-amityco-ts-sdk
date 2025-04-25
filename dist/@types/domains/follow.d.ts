export {};
declare global {
    namespace Amity {
        const enum FollowActionTypeEnum {
            OnRequested = "onRequested",
            OnAccepted = "onAccepted",
            OnDeclined = "onDeclined",
            OnCanceled = "onCanceled",
            OnFollowed = "onFollowed",
            OnUnfollowed = "onUnfollowed",
            OnDeleted = "onDeleted"
        }
        type FollowActionType = `${FollowActionTypeEnum}`;
        const enum FollowStatusTypeEnum {
            All = "all",
            Pending = "pending",
            Accepted = "accepted",
            Blocked = "blocked",
            None = "none"
        }
        type FollowStatusType = `${FollowStatusTypeEnum}`;
        type RawFollowStatus = {
            from: Amity.InternalUser['userId'];
            to: Amity.InternalUser['userId'];
            status: Exclude<FollowStatusType, 'all'>;
        } & Amity.CreatedAt & Amity.UpdatedAt;
        type InternalFollowStatus = Amity.RawFollowStatus;
        type FollowStatus = InternalFollowStatus;
        type FollowCount = {
            userId: Amity.InternalUser['userId'];
            followerCount: number;
            followingCount: number;
            pendingCount: number;
        };
        type FollowInfo = {
            status?: FollowStatus['status'];
        } & FollowCount;
        type QueryFollowers = {
            userId: Amity.InternalUser['userId'];
            status?: Exclude<Amity.FollowStatusType, 'none'>;
            page?: Amity.PageRaw;
        };
        type FollowerLiveCollection = Amity.LiveCollectionParams<Omit<QueryFollowers, 'page'>>;
        type FollowerLiveCollectionCache = Amity.LiveCollectionCache<Amity.FollowInfo['userId'], Pick<QueryFollowers, 'page'>>;
        type QueryFollowings = QueryFollowers;
        type FollowingLiveCollection = FollowerLiveCollection;
        type FollowingLiveCollectionCache = FollowerLiveCollectionCache;
    }
}
