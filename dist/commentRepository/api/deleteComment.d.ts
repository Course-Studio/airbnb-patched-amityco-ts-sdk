/**
 * ```js
 * import { CommentRepository } from '@amityco/ts-sdk'
 * const success = await CommentRepository.deleteComment('foobar')
 * ```
 *
 * Deletes a {@link Amity.Comment}
 *
 * @param commentId The {@link Amity.Comment} ID to delete
 * @return A success boolean if the {@link Amity.Comment} was deleted
 *
 * @category Comment API
 * @async
 */
export declare const deleteComment: (commentId: Amity.Comment["commentId"], permanent?: boolean) => Promise<Amity.Comment>;
