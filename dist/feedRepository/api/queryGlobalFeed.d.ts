/**
 * ```js
 * import { queryGlobalFeed } from '@amityco/ts-sdk'
 * const posts = await queryGlobalFeed()
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
export declare const queryGlobalFeed: {
    (query?: Amity.QueryGlobalFeed): Promise<Omit<Amity.Cached<Amity.Paged<Amity.Post> & Amity.Pagination>, "nextPage" | "prevPage">>;
    locally(query?: Parameters<typeof queryGlobalFeed>[0]): Omit<Amity.Cached<Amity.Paged<Amity.Post> & Amity.Pagination>, "nextPage" | "prevPage"> | undefined;
};
