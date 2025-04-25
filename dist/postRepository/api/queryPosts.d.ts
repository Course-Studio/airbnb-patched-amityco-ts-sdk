/**
 * ```js
 * import { queryPosts } from '@amityco/ts-sdk'
 * const { data: posts, prevPage, nextPage } = await queryPosts({ targetId, targetType })
 * ```
 *
 * Queries a paginable list of {@link Amity.Post} objects
 *
 * @param query The query parameters
 * @returns posts
 *
 * @category Post API
 * @async
 */
export declare const queryPosts: (query: Amity.QueryPosts) => Promise<Amity.Cached<Amity.PageToken<Amity.Post>>>;
