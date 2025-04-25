/**
 * Get pinned posts for a community
 *
 * @param communityId the ID of the community
 * @param placement the placement of the pinned post ('announcement' or 'default'), or null to fetch all pinned posts
 * @returns the associated pinned post(s)
 *
 * @category Pined Posts Live Collection
 *
 */
export declare const getPinnedPosts: (params: Amity.LiveCollectionParams<Amity.PinnedPostLiveCollection>, callback: Amity.LiveCollectionCallback<Amity.PinnedPost>, config?: Amity.LiveCollectionConfig) => () => void;
//# sourceMappingURL=getPinnedPosts.d.ts.map