/**
 * ```js
 * import { CommentRepository } from '@amityco/ts-sdk'
 * const isReported = await CommentRepository.isCommentFlaggedByMe('commentId')
 * ```
 *
 * @param commentId The ID of the comment to check if flagged by current user
 * @returns `true` if the comment is flagged by me, `false` if doesn't.
 *
 * @category Comment API
 * @async
 * */
export declare const isCommentFlaggedByMe: (commentId: Amity.Comment['commentId']) => Promise<boolean>;
