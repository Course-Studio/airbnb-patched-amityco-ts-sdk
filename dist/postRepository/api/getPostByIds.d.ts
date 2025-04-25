/**
 * ```js
 * import { getPostByIds } from '@amityco/ts-sdk'
 * const { data: posts } = await getPostByIds(['foo', 'bar'])
 * ```
 *
 * Fetches a collection of {@link Amity.Post} objects
 *
 * @param postIds the IDs of the {@link Amity.Post} to fetch
 * @returns the associated collection of {@link Amity.Post} objects
 *
 * @category Post API
 * @async
 */
export declare const getPostByIds: {
    (postIds: Amity.Post["postId"][]): Promise<Amity.Cached<Amity.Post[]>>;
    locally(postIds: Amity.Post["postId"][]): Amity.Cached<Amity.Post[]> | undefined;
};
