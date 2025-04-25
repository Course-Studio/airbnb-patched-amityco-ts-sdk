/**
 * ```js
 * import { FeedRepository } from '@amityco/ts-sdk'
 * const posts = await FeedRepository.getCustomRankingGlobalFeed()
 * ```
 *
 * Queries a paginable list of {@link Amity.Post} objects
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.Post} objects
 *
 * @category Feed API
 * @async
 * */
export declare const getCustomRankingGlobalFeed: {
    (query?: {
        dataTypes?: ('video' | 'image' | 'file' | 'liveStream')[];
        limit?: number;
        queryToken?: string;
    }): Promise<Omit<Amity.Cached<Amity.Paged<Amity.Post>> & Amity.Pagination, 'nextPage' | 'prevPage'>>;
    /**
     * ```js
     * import { FeedRepository } from '@amityco/ts-sdk'
     * const posts = await FeedRepository.getCustomRankingGlobalFeed.locally()
     * ```
     *
     * Queries a paginable list of {@link Amity.Post} objects from cache
     *
     * @param query The query parameters
     * @returns A page of {@link Amity.Post} objects
     *
     * @category Feed API
     * @async
     * */
    locally(query?: Parameters<typeof getCustomRankingGlobalFeed>[0]): Omit<Amity.Cached<Amity.Paged<Amity.Post>> & Amity.Pagination, 'nextPage' | 'prevPage'> | undefined;
};
