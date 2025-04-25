/**
 * ```js
 * import { PostRepository } from '@amityco/ts-sdk'
 * const success = await PostRepository.softDeletePost('foobar')
 * ```
 *
 * Soft deletes a {@link Amity.Post}
 *
 * @param postId The {@link Amity.Post} ID to soft delete
 * @return A success boolean if the {@link Amity.Post} was deleted
 *
 * @category Post API
 * @async
 */
export declare const softDeletePost: (postId: Amity.Post['postId']) => Promise<Amity.Post>;
