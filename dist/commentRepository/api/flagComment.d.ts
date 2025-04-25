/**
 * ```js
 * import { CommentRepository } from '@amityco/ts-sdk'
 * const flagged = await CommentRepository.flagComment('commentId')
 * ```
 *
 * @param commentId The ID of the comment to flag
 * @returns the created report result
 *
 * @category Comment API
 * @async
 * */
export declare const flagComment: (commentId: Amity.Comment['commentId']) => Promise<boolean>;
//# sourceMappingURL=flagComment.d.ts.map