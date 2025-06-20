/**
 * ```js
 * import { CommentRepository } from '@amityco/ts-sdk'
 * const updated = await CommentRepository.updateComment(commentId, {
 *   data: { text: 'hello world' }
 * })
 * ```
 *
 * Updates an {@link Amity.Comment}
 *
 * @param commentId The ID of the {@link Amity.Comment} to edit
 * @param patch The patch data to apply
 * @returns the updated {@link Amity.Comment} object
 *
 * @category Comment API
 * @async
 */
export declare const updateComment: (commentId: Amity.Comment["commentId"], patch: Patch<Amity.Comment, "data" | "metadata" | "mentionees">) => Promise<Amity.Cached<Amity.Comment>>;
