/**
 * ```js
 * import { deletePost } from '@amityco/ts-sdk'
 * const success = await deletePost('foobar')
 * ```
 *
 * Deletes a {@link Amity.Post}
 *
 * @param postId The {@link Amity.Post} ID to delete
 * @return A success boolean if the {@link Amity.Post} was deleted
 *
 * @private
 * @async
 */
export declare const deletePost: (postId: Amity.Post["postId"], permanent?: boolean) => Promise<Amity.Post>;
