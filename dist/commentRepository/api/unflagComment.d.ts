/**
 * ```js
 * import { CommentRepository } from '@amityco/ts-sdk'
 * const unflagged = await CommentRepository.unflagComment('commentId')
 * ```
 *
 * @param commentId The ID of comment to unflag
 * @returns the unflagged result
 *
 * @category Comment API
 * @async
 * */
export declare const unflagComment: (commentId: Amity.Comment['commentId']) => Promise<boolean>;
