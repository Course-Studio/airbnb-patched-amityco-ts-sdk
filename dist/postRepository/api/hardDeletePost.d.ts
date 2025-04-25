/**
 * ```js
 * import { hardDeletePost } from '@amityco/ts-sdk'
 * const success = await hardDeletePost('foobar')
 * ```
 *
 * Hard deletes a {@link Amity.Post}
 *
 * @param postId The {@link Amity.Post} ID to be hard delete
 * @return A success boolean if the {@link Amity.Post} was deleted
 *
 * @category Post API
 * @async
 */
export declare const hardDeletePost: (postId: Amity.Post['postId']) => Promise<Amity.Post>;
//# sourceMappingURL=hardDeletePost.d.ts.map