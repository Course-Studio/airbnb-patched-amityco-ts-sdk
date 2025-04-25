/**
 * search posts by semantic search
 *
 * @returns the associated pinned post(s)
 *
 * @category Posts Live Collection
 *
 */
export declare const semanticSearchPosts: (params: Amity.LiveCollectionParams<Amity.SemanticSearchPostLiveCollection>, callback: Amity.LiveCollectionCallback<Amity.Post>, config?: Amity.LiveCollectionConfig) => () => void;
