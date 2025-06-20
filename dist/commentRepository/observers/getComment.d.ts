/**
 * ```js
 * import { CommentRepository } from '@amityco/ts-sdk';
 *
 * let comment;
 *
 * const unsub = CommentRepository.getComment(commentId, response => {
 *   comment = response.data;
 * });
 * ```
 *
 * Observe all mutation on a given {@link Amity.Comment}
 *
 * @param commentId the ID of the comment to observe
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the comment
 *
 * @category Comment Live Object
 */
export declare const getComment: (commentId: Amity.Comment["commentId"], callback: Amity.LiveObjectCallback<Amity.Comment>) => Amity.Unsubscriber;
