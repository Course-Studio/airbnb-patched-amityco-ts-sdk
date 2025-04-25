/**
 * ```js
 * import { CommentRepository } from '@amityco/ts-sdk'
 * const success = await CommentRepository.hardDeleteComment('foobar')
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
export declare const hardDeleteComment: (commentId: Amity.Comment['commentId']) => Promise<Amity.Comment>;
//# sourceMappingURL=hardDeleteComment.d.ts.map